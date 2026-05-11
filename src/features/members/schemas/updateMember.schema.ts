import { z } from 'zod';
import { phoneSchema } from '@utils/validators';

export const updateMemberSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || phoneSchema.safeParse(v).success, {
      message:
        'Telefono invalido. Formato: 58 + prefijo (412/414/416/424/426) + 7 digitos. Ej: 584141771490',
    }),
});

export type UpdateMemberFormValues = z.infer<typeof updateMemberSchema>;
