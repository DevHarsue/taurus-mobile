import { z } from 'zod';

export const PHONE_REGEX = /^\+?58(412|414|416|418|422|424|426)\d{7}$/;
export const CEDULA_REGEX = /^\d{7,10}$/;
export const PASSWORD_REGEX =
  /^(?=(?:.*\d){2,})(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]).{8,}$/;
export const PASSWORD_MIN_LENGTH = 8;

// Normaliza el telefono eliminando el '+' inicial opcional antes de enviar/persistir.
export const normalizePhone = (value: string): string => value.replace(/^\+/, '');

export const phoneSchema = z
  .string()
  .regex(
    PHONE_REGEX,
    'Teléfono inválido. Formato: 58 + prefijo (412/414/416/418/422/424/426) + 7 dígitos. Ej: 584141771490',
  );

export const cedulaSchema = z
  .string()
  .regex(CEDULA_REGEX, 'Cédula inválida. Solo números, entre 7 y 10 dígitos');

export const emailSchema = z
  .string()
  .min(1, 'Email requerido')
  .email('Email inválido')
  .max(254, 'El email no puede superar 254 caracteres');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
  .regex(
    PASSWORD_REGEX,
    'La contraseña debe incluir al menos 2 números, 1 mayúscula, 1 minúscula y 1 carácter especial',
  );
