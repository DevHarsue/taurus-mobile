import { useQuery } from '@hooks/useQuery';
import { useMutation } from '@hooks/useMutation';
import { routinesService } from '@api/services';
import { newTempId, runOrEnqueue, type OfflineOutcome } from '@offline';
import type {
  CreateExerciseRequest,
  Exercise,
  UpdateExerciseRequest,
} from '@app-types/routine';

export function useExercises() {
  return useQuery<Exercise[]>({
    queryFn: () => routinesService.getExercises(),
    errorMessage: 'No se pudo cargar el catálogo de ejercicios',
    cacheKey: 'exercises:list',
  });
}

export function useCreateExercise() {
  return useMutation<CreateExerciseRequest, OfflineOutcome<Exercise>>({
    mutationFn: (body) =>
      runOrEnqueue({
        type: 'exercises.create',
        payload: body,
        label: `Crear ejercicio ${body.name}`,
        run: (key) =>
          routinesService.createExercise(body, { idempotencyKey: key }),
        optimistic: () => ({
          id: newTempId(),
          name: body.name,
          description: body.description ?? null,
          muscleGroup: body.muscleGroup ?? null,
          equipment: body.equipment ?? null,
          measurementType: body.measurementType ?? 'weight_reps',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }),
    errorMessage: 'No se pudo crear el ejercicio',
  });
}

export interface UpdateExerciseInput {
  exerciseId: string;
  body: UpdateExerciseRequest;
}

export function useUpdateExercise() {
  return useMutation<UpdateExerciseInput, OfflineOutcome<void>>({
    mutationFn: ({ exerciseId, body }) =>
      runOrEnqueue({
        type: 'exercises.update',
        payload: { exerciseId, body },
        label: `Actualizar ejercicio`,
        run: async (key) => {
          await routinesService.updateExercise(exerciseId, body, {
            idempotencyKey: key,
          });
        },
        optimistic: () => undefined,
      }),
    errorMessage: 'No se pudo actualizar el ejercicio',
  });
}

export function useDeleteExercise() {
  return useMutation<string, OfflineOutcome<void>>({
    mutationFn: (exerciseId) =>
      runOrEnqueue({
        type: 'exercises.delete',
        payload: { exerciseId },
        label: `Eliminar ejercicio`,
        run: async (key) => {
          await routinesService.deleteExercise(exerciseId, {
            idempotencyKey: key,
          });
        },
        optimistic: () => undefined,
      }),
    errorMessage: 'No se pudo eliminar el ejercicio',
  });
}
