import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  durationDays: z.string().min(1, 'Duracion requerida'),
  referencePrice: z.string().optional(),
  isActive: z.boolean(),
});

export type CreatePlanFormValues = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = createPlanSchema.partial();

export type UpdatePlanFormValues = z.infer<typeof updatePlanSchema>;
