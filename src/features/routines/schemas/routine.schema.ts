import { z } from 'zod';

export const exerciseSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
  description: z.string().optional(),
  measurementType: z.enum(['weight_reps', 'reps', 'time', 'distance']),
});

export type ExerciseFormValues = z.infer<typeof exerciseSchema>;

export const routineHeaderSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  goal: z.string().optional(),
  description: z.string().optional(),
});

export type RoutineHeaderFormValues = z.infer<typeof routineHeaderSchema>;
