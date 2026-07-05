import { membersService, routinesService } from '@api/services';
import type {
  CreateMemberRequest,
  RenewMemberRequest,
  UpdateMemberRequest,
} from '@app-types/member';
import type {
  AssignRoutineRequest,
  CreateExerciseRequest,
  CreateRoutineRequest,
  LogWorkoutRequest,
  UpdateExerciseRequest,
  UpdateRoutineRequest,
} from '@app-types/routine';
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

export interface UpdateExercisePayload {
  exerciseId: string;
  body: UpdateExerciseRequest;
}

export interface DeleteExercisePayload {
  exerciseId: string;
}

export interface UpdateRoutinePayload {
  routineId: string;
  body: UpdateRoutineRequest;
}

export interface DeleteRoutinePayload {
  routineId: string;
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

  // ─── Rutinas: catalogo de ejercicios (admin) ──────────────────────────────
  'exercises.create': {
    run: (payload: CreateExerciseRequest, key) =>
      routinesService.createExercise(payload, { idempotencyKey: key }),
    invalidates: () => ['exercises:list'],
  },
  'exercises.update': {
    run: (payload: UpdateExercisePayload, key) =>
      routinesService.updateExercise(payload.exerciseId, payload.body, {
        idempotencyKey: key,
      }),
    invalidates: () => ['exercises:list'],
  },
  'exercises.delete': {
    run: (payload: DeleteExercisePayload, key) =>
      routinesService.deleteExercise(payload.exerciseId, {
        idempotencyKey: key,
      }),
    invalidates: () => ['exercises:list'],
  },

  // ─── Rutinas: plantillas (admin) ──────────────────────────────────────────
  'routines.create': {
    run: (payload: CreateRoutineRequest, key) =>
      routinesService.createRoutine(payload, { idempotencyKey: key }),
    invalidates: () => ['routines:list'],
  },
  'routines.update': {
    run: (payload: UpdateRoutinePayload, key) =>
      routinesService.updateRoutine(payload.routineId, payload.body, {
        idempotencyKey: key,
      }),
    invalidates: (payload: UpdateRoutinePayload) => [
      'routines:list',
      `routine:${payload.routineId}`,
    ],
  },
  'routines.delete': {
    run: (payload: DeleteRoutinePayload, key) =>
      routinesService.deleteRoutine(payload.routineId, {
        idempotencyKey: key,
      }),
    invalidates: (payload: DeleteRoutinePayload) => [
      'routines:list',
      `routine:${payload.routineId}`,
    ],
  },
  'routines.assign': {
    run: (payload: AssignRoutineRequest, key) =>
      routinesService.assignRoutine(payload, { idempotencyKey: key }),
    invalidates: (payload: AssignRoutineRequest) => [
      `routine:member:${payload.memberId}`,
    ],
  },

  // ─── Rutinas: diario del miembro (offline-first) ──────────────────────────
  'workouts.log': {
    run: (payload: LogWorkoutRequest, key) =>
      routinesService.logWorkout(payload, { idempotencyKey: key }),
    invalidates: () => ['routine:me:history'],
  },
};
