import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  durationDays: z.coerce.number().int().positive('Debe ser mayor a 0'),
  referencePrice: z.coerce
    .number()
    .nonnegative('Precio no puede ser negativo')
    .default(0),
  isActive: z.boolean().default(true),
});

export type CreatePlanFormValues = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = createPlanSchema.partial();

export type UpdatePlanFormValues = z.infer<typeof updatePlanSchema>;
