import { useQuery } from '@hooks/useQuery';
import { useMutation } from '@hooks/useMutation';
import { routinesService } from '@api/services';
import { runOrEnqueue, type OfflineOutcome } from '@offline';
import type {
  LogWorkoutRequest,
  MemberSchedule,
  WorkoutLog,
} from '@app-types/routine';

/** Horario semanal del miembro (rutina por día), cacheado offline. */
export function useMySchedule() {
  return useQuery<MemberSchedule>({
    queryFn: () => routinesService.getMySchedule(),
    deps: [],
    errorMessage: 'No se pudo cargar tu rutina',
    // v2: array de días. Clave nueva para no chocar con el bundle v1.
    cacheKey: 'schedule:me',
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

/** Historial de entrenamientos de un miembro (seguimiento admin). */
export function useMemberWorkoutHistory(memberId: string) {
  return useQuery<WorkoutLog[]>({
    queryFn: () => routinesService.getMemberHistory(memberId),
    deps: [memberId],
    errorMessage: 'No se pudo cargar el historial del miembro',
    cacheKey: `routine:member:${memberId}:history`,
  });
}

/** Registro de entrenamiento (reps/peso/tiempo/distancia) offline-aware. */
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
