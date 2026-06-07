import { getIsOnline } from './ConnectivityContext';
import { isNetworkError } from './errors';
import { newUuid } from './ids';
import { outbox } from './OutboxQueue';
import type { OperationType } from './types';

/** Resultado de una mutacion offline-aware. */
export interface OfflineOutcome<T> {
  /** true si la operacion quedo encolada en el buffer (sin conexion). */
  queued: boolean;
  /** Resultado real (online) u optimista (encolada). */
  result: T;
}

export interface RunOrEnqueueOptions<P, T> {
  /** Tipo registrado en OPERATION_REGISTRY (como se re-ejecuta al flush). */
  type: OperationType;
  /** Payload serializable que consumira el registry al sincronizar. */
  payload: P;
  /** Texto en espanol para la pantalla de pendientes. */
  label: string;
  /** Ejecucion online directa. Recibe la Idempotency-Key generada. */
  run: (idempotencyKey: string) => Promise<T>;
  /** Resultado optimista a devolver cuando la operacion se encola. */
  optimistic: () => T;
}

/**
 * Punto central de decision del buffer offline:
 * - Online: ejecuta la mutacion con una Idempotency-Key fresca (un retry
 *   tras timeout tampoco duplica). Si la red se cae a mitad de la peticion
 *   (error de red), la operacion se encola en vez de fallar.
 * - Offline: encola en el outbox y devuelve el resultado optimista.
 */
export async function runOrEnqueue<P, T>(
  options: RunOrEnqueueOptions<P, T>,
): Promise<OfflineOutcome<T>> {
  const { type, payload, label, run, optimistic } = options;

  if (!getIsOnline()) {
    await outbox.enqueue(type, payload, label);
    return { queued: true, result: optimistic() };
  }

  const idempotencyKey = newUuid();
  try {
    const result = await run(idempotencyKey);
    return { queued: false, result };
  } catch (error) {
    if (isNetworkError(error)) {
      // La conexion se perdio durante la peticion: encolar en vez de fallar.
      // Se reutiliza la MISMA key — si la peticion original llego al
      // servidor, el re-envio devolvera la respuesta cacheada (no duplica).
      await outbox.enqueue(type, payload, label, idempotencyKey);
      return { queued: true, result: optimistic() };
    }
    throw error;
  }
}
