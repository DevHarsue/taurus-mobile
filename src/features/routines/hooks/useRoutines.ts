import { useQuery } from '@hooks/useQuery';
import { useMutation } from '@hooks/useMutation';
import { routinesService } from '@api/services';
import { runOrEnqueue, type OfflineOutcome } from '@offline';
import type {
  AssignRoutineRequest,
  CreateRoutineRequest,
  Routine,
  RoutineAssignment,
  RoutineDetail,
  UpdateRoutineRequest,
} from '@app-types/routine';

export function useRoutines() {
  return useQuery<Routine[]>({
    queryFn: () => routinesService.getRoutines(),
    errorMessage: 'No se pudieron cargar las rutinas',
    cacheKey: 'routines:list',
  });
}

export function useRoutine(id: string, enabled = true) {
  return useQuery<RoutineDetail>({
    queryFn: () => routinesService.getRoutine(id),
    deps: [id],
    enabled: enabled && !!id,
    errorMessage: 'No se pudo cargar la rutina',
    cacheKey: `routine:${id}`,
  });
}

export function useCreateRoutine() {
  return useMutation<CreateRoutineRequest, OfflineOutcome<void>>({
    mutationFn: (body) =>
      runOrEnqueue({
        type: 'routines.create',
        payload: body,
        label: `Crear rutina ${body.name}`,
        run: async (key) => {
          await routinesService.createRoutine(body, { idempotencyKey: key });
        },
        optimistic: () => undefined,
      }),
    errorMessage: 'No se pudo crear la rutina',
  });
}

export interface UpdateRoutineInput {
  routineId: string;
  body: UpdateRoutineRequest;
}

export function useUpdateRoutine() {
  return useMutation<UpdateRoutineInput, OfflineOutcome<void>>({
    mutationFn: ({ routineId, body }) =>
      runOrEnqueue({
        type: 'routines.update',
        payload: { routineId, body },
        label: `Actualizar rutina`,
        run: async (key) => {
          await routinesService.updateRoutine(routineId, body, {
            idempotencyKey: key,
          });
        },
        optimistic: () => undefined,
      }),
    errorMessage: 'No se pudo actualizar la rutina',
  });
}

export function useDeleteRoutine() {
  return useMutation<string, OfflineOutcome<void>>({
    mutationFn: (routineId) =>
      runOrEnqueue({
        type: 'routines.delete',
        payload: { routineId },
        label: `Eliminar rutina`,
        run: async (key) => {
          await routinesService.deleteRoutine(routineId, {
            idempotencyKey: key,
          });
        },
        optimistic: () => undefined,
      }),
    errorMessage: 'No se pudo eliminar la rutina',
  });
}

export function useAssignRoutine() {
  return useMutation<AssignRoutineRequest, OfflineOutcome<void>>({
    mutationFn: (body) =>
      runOrEnqueue({
        type: 'routines.assign',
        payload: body,
        label: `Asignar rutina a miembro`,
        run: async (key) => {
          await routinesService.assignRoutine(body, { idempotencyKey: key });
        },
        optimistic: () => undefined,
      }),
    errorMessage: 'No se pudo asignar la rutina',
  });
}

export function useMemberAssignment(memberId: string, enabled = true) {
  return useQuery<RoutineAssignment | null>({
    queryFn: () => routinesService.getMemberAssignment(memberId),
    deps: [memberId],
    enabled: enabled && !!memberId,
    errorMessage: 'No se pudo cargar la asignación del miembro',
    cacheKey: `routine:member:${memberId}`,
  });
}
