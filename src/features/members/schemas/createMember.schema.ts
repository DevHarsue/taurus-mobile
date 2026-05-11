import { z } from 'zod';
import {
  cedulaSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
} from '@utils/validators';

export const createMemberSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  cedula: cedulaSchema,
  email: emailSchema,
  phone: z
    .string()
    .optional()
    .refine((v) => !v || phoneSchema.safeParse(v).success, {
      message:
        'Telefono invalido. Formato: 58 + prefijo (412/414/416/424/426) + 7 digitos. Ej: 584141771490',
    }),
  password: z
    .string()
    .optional()
    .refine((v) => !v || passwordSchema.safeParse(v).success, {
      message:
        'La contrasena debe tener al menos 8 caracteres, 2 numeros, 1 mayuscula, 1 minuscula y 1 caracter especial',
    }),
  fingerprintId: z.string().optional(),
});

export type CreateMemberFormValues = z.infer<typeof createMemberSchema>;
