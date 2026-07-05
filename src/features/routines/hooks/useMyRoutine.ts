import { useQuery } from '@hooks/useQuery';
import { useMutation } from '@hooks/useMutation';
import { routinesService } from '@api/services';
import { runOrEnqueue, type OfflineOutcome } from '@offline';
import type {
  LogWorkoutRequest,
  MemberRoutineBundle,
  WorkoutLog,
} from '@app-types/routine';

/** Bundle de la rutina del miembro (asignación + rutina completa), cacheado offline. */
export function useMyRoutine() {
  return useQuery<MemberRoutineBundle>({
    queryFn: () => routinesService.getMyRoutine(),
    deps: [],
    errorMessage: 'No se pudo cargar tu rutina',
    cacheKey: 'routine:me',
  });
}

/** Historial de entrenamientos del miembro, cacheado offline. */
export function useWorkoutHistory(limit?: number) {
  return useQuery<WorkoutLog[]>({
    queryFn: () => routinesService.getMyHistory(limit),
    deps: [limit ?? 0],
    errorMessage: 'No se pudo cargar tu historial',
    cacheKey: 'routine:me:history',
  });
}

/** Registro de entrenamiento (pesos/reps reales) offline-aware. */
export function useLogWorkout() {
  return useMutation<LogWorkoutRequest, OfflineOutcome<void>>({
    mutationFn: (body) =>
      runOrEnqueue({
        type: 'workouts.log',
        payload: body,
        label: `Registrar entrenamiento ${body.dayLabel ?? ''}`.trim(),
        run: async (key) => {
          await routinesService.logWorkout(body, { idempotencyKey: key });
        },
        optimistic: () => undefined,
      }),
    errorMessage: 'No se pudo registrar el entrenamiento',
  });
}
