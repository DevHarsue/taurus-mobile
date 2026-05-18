import { z } from 'zod';
import { cedulaSchema, phoneSchema } from '@utils/validators';

export const completeProfileSchema = z.object({
  cedula: cedulaSchema,
  phone: phoneSchema,
});

export type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>;
