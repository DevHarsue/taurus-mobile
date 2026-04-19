import { z } from 'zod';

export const createMemberSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  cedula: z.string().min(1, 'Cedula requerida'),
  email: z.string().min(1, 'Email requerido').email('Email invalido'),
  phone: z.string().optional(),
  password: z.string().optional(),
  fingerprintId: z.string().optional(),
});

export type CreateMemberFormValues = z.infer<typeof createMemberSchema>;
