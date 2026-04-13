import { z } from 'zod';

export const createMemberSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  cedula: z.string().min(1, 'Cedula requerida'),
  phone: z.string().min(1, 'Telefono requerido'),
  email: z.string().email('Email invalido'),
});

export type CreateMemberFormValues = z.infer<typeof createMemberSchema>;
