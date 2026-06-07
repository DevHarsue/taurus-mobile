import { membersService } from '@api/services';
import type {
  CreateMemberRequest,
  RenewMemberRequest,
  UpdateMemberRequest,
} from '@app-types/member';
import type { OperationType } from './types';

/**
 * Registry de operaciones encolables: en disco solo se guarda
 * { type, payload } (serializable); este registry mapea el `type`
 * a la llamada real al service al hacer flush.
 */
export interface OperationDef {
  /** Ejecuta la mutacion real. Recibe la Idempotency-Key (= id de la op). */
  run: (payload: never, idempotencyKey: string) => Promise<unknown>;
  /** Claves de ReadCache a invalidar tras el exito. */
  invalidates: (payload: never) => string[];
}

export interface RenewPayload {
  memberId: string;
  body: RenewMemberRequest;
}

export interface UpdateMemberPayload {
  memberId: string;
  body: UpdateMemberRequest;
}

export interface DeleteMemberPayload {
  memberId: string;
}

export const OPERATION_REGISTRY: Record<OperationType, OperationDef> = {
  'members.create': {
    run: (payload: CreateMemberRequest, key) =>
      membersService.create(payload, { idempotencyKey: key }),
    invalidates: () => ['members:list', 'members:snapshot'],
  },
  'members.update': {
    run: (payload: UpdateMemberPayload, key) =>
      membersService.update(payload.memberId, payload.body, {
        idempotencyKey: key,
      }),
    invalidates: (payload: UpdateMemberPayload) => [
      'members:list',
      'members:snapshot',
      `member:${payload.memberId}`,
    ],
  },
  'members.delete': {
    run: (payload: DeleteMemberPayload, key) =>
      membersService.remove(payload.memberId, { idempotencyKey: key }),
    invalidates: (payload: DeleteMemberPayload) => [
      'members:list',
      'members:snapshot',
      `member:${payload.memberId}`,
    ],
  },
  'members.renew': {
    run: (payload: RenewPayload, key) =>
      membersService.renew(payload.memberId, payload.body, {
        idempotencyKey: key,
      }),
    invalidates: (payload: RenewPayload) => [
      'members:list',
      'members:snapshot',
      `member:${payload.memberId}`,
      `subscriptions:${payload.memberId}`,
    ],
  },
};
