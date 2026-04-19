import { z } from 'zod';

export const updateMemberSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  phone: z.string().optional(),
});

export type UpdateMemberFormValues = z.infer<typeof updateMemberSchema>;
