import { AxiosError } from 'axios';

/** Error de red/timeout: la peticion nunca obtuvo respuesta del servidor. */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response;
  }
  return false;
}

/**
 * Error permanente del servidor (4xx, salvo 408 timeout y 429 rate limit):
 * reintentar no lo arregla; la operacion encolada pasa a 'failed'.
 */
export function isPermanent4xx(error: unknown): boolean {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    return status >= 400 && status < 500 && status !== 408 && status !== 429;
  }
  return false;
}

/** Mensaje legible del backend (o fallback) para mostrar en la UI. */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}
