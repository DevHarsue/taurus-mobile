import { computeBackoff } from './backoff';
import { extractErrorMessage, isPermanent4xx } from './errors';
import { newUuid } from './ids';
import { kvStore } from './kvStore';
import { OPERATION_REGISTRY } from './operationRegistry';
import { ReadCache } from './ReadCache';
import type { OperationType, OutboxOp } from './types';

const STORAGE_KEY = 'taurus.outbox.v1';

type Listener = () => void;

/**
 * Buffer centralizado de escrituras pendientes (outbox).
 *
 * Las mutaciones encoladas offline se persisten en disco y se re-envian
 * en orden FIFO al recuperar conexion. Cada operacion usa su `id` como
 * Idempotency-Key: los re-envios no duplican datos en el backend.
 *
 * Politica de errores en flush():
 * - exito           → invalida caches relacionadas y elimina la op
 * - 4xx permanente  → status 'failed' (visible en Pendientes), NO bloquea
 * - red / 5xx       → backoff y se detiene (preserva orden FIFO)
 */
class OutboxQueueImpl {
  private ops: OutboxOp[] = [];
  private loaded = false;
  private flushing = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<Listener>();

  // ── Persistencia ─────────────────────────────────────────────────────

  async init(): Promise<void> {
    if (this.loaded) return;
    const stored = await kvStore.getJson<OutboxOp[]>(STORAGE_KEY);
    if (stored) {
      // Las ops que quedaron 'in-flight' por un cierre abrupto vuelven a
      // 'pending': la Idempotency-Key garantiza que no se dupliquen.
      this.ops = stored.map((op) =>
        op.status === 'in-flight' ? { ...op, status: 'pending' } : op,
      );
    }
    this.loaded = true;
    this.notify();
  }

  private async persist(): Promise<void> {
    await kvStore.setJson(STORAGE_KEY, this.ops);
  }

  // ── Suscripcion (para OutboxContext) ─────────────────────────────────

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // ── API publica ──────────────────────────────────────────────────────

  list(): OutboxOp[] {
    return [...this.ops];
  }

  get pendingCount(): number {
    return this.ops.length;
  }

  get hasPending(): boolean {
    return this.ops.some((op) => op.status !== 'failed');
  }

  async enqueue<P>(
    type: OperationType,
    payload: P,
    label: string,
    /**
     * Idempotency-Key explicita: cuando una peticion online fallo por red
     * tras (posiblemente) llegar al servidor, el re-envio debe reutilizar
     * la MISMA key para que el backend no duplique la operacion.
     */
    id?: string,
  ): Promise<OutboxOp<P>> {
    await this.init();
    const op: OutboxOp<P> = {
      id: id ?? newUuid(),
      type,
      payload,
      createdAt: Date.now(),
      retries: 0,
      status: 'pending',
      label,
    };
    this.ops.push(op);
    await this.persist();
    this.notify();
    return op;
  }

  /** Re-encola una operacion 'failed' para reintentarla. */
  async retry(id: string): Promise<void> {
    const op = this.ops.find((o) => o.id === id);
    if (!op || op.status !== 'failed') return;
    op.status = 'pending';
    op.retries = 0;
    op.lastError = undefined;
    await this.persist();
    this.notify();
    void this.flush();
  }

  async discard(id: string): Promise<void> {
    this.ops = this.ops.filter((o) => o.id !== id);
    await this.persist();
    this.notify();
  }

  // ── Flush ────────────────────────────────────────────────────────────

  async flush(): Promise<void> {
    await this.init();
    if (this.flushing) return;
    this.flushing = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    try {
      for (;;) {
        const op = this.ops.find((o) => o.status === 'pending');
        if (!op) break;

        op.status = 'in-flight';
        this.notify();

        try {
          const def = OPERATION_REGISTRY[op.type];
          await def.run(op.payload as never, op.id);

          def
            .invalidates(op.payload as never)
            .forEach((key) => ReadCache.invalidate(key));
          this.ops = this.ops.filter((o) => o.id !== op.id);
          await this.persist();
          this.notify();
        } catch (error) {
          if (isPermanent4xx(error)) {
            // Error definitivo (p.ej. cedula duplicada): visible al usuario,
            // no bloquea las siguientes operaciones.
            op.status = 'failed';
            op.lastError = extractErrorMessage(error);
            await this.persist();
            this.notify();
            continue;
          }

          // Red / 5xx / timeout: backoff y detener para preservar el orden.
          op.status = 'pending';
          op.retries += 1;
          op.lastError = extractErrorMessage(error);
          await this.persist();
          this.notify();
          this.scheduleRetry(computeBackoff(op.retries));
          break;
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  private scheduleRetry(delayMs: number): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.flush();
    }, delayMs);
  }
}

export const outbox = new OutboxQueueImpl();
