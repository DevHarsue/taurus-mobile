/** Tipos de operaciones encolables offline (v1: solo las criticas). */
export type OperationType =
  | 'members.create'
  | 'members.update'
  | 'members.delete'
  | 'members.renew';

export type OpStatus = 'pending' | 'in-flight' | 'failed';

/** Operacion pendiente en el buffer (outbox). Serializable: sin closures. */
export interface OutboxOp<P = unknown> {
  /** UUID; tambien se envia como header Idempotency-Key al backend. */
  id: string;
  type: OperationType;
  payload: P;
  createdAt: number;
  retries: number;
  status: OpStatus;
  lastError?: string;
  /** Texto en espanol para la UI, p.ej. "Renovar membresía de Ana". */
  label: string;
}

export interface ReadCacheEntry<T = unknown> {
  data: T;
  updatedAt: number;
}
