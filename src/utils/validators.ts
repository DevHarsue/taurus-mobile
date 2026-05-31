import { z } from 'zod';

export const PHONE_REGEX = /^\+?58(412|414|416|418|422|424|426)\d{7}$/;
export const CEDULA_REGEX = /^\d{7,10}$/;
export const PASSWORD_REGEX =
  /^(?=(?:.*\d){2,})(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]).{8,}$/;
export const PASSWORD_MIN_LENGTH = 8;

export const phoneSchema = z
  .string()
  // TODO: confirmar con usuario si se debe normalizar (strip '+') antes de persistir
  .regex(
    PHONE_REGEX,
    'Telefono invalido. Formato: 58 + prefijo (412/414/416/418/422/424/426) + 7 digitos. Ej: 584141771490',
  );

export const cedulaSchema = z
  .string()
  .regex(CEDULA_REGEX, 'Cedula invalida. Solo numeros, entre 7 y 10 digitos');

export const emailSchema = z
  .string()
  .min(1, 'Email requerido')
  .email('Email invalido')
  .max(254, 'El email no puede superar 254 caracteres');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `La contrasena debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
  .regex(
    PASSWORD_REGEX,
    'La contrasena debe incluir al menos 2 numeros, 1 mayuscula, 1 minuscula y 1 caracter especial',
  );
