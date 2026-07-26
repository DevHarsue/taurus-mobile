import { AxiosError } from 'axios';
import { useMutation } from '@hooks/useMutation';
import { useAuth } from '@hooks/useAuth';
import { haptics } from '@utils/haptics';
// Import profundo (no el barrel @offline) para evitar dependencia circular.
import { isNetworkError } from '@offline/errors';
import type { LoginRequest } from '@app-types/auth';

// Codigos que envia auth-service en el login (campo `code` del error 401).
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_FOUND: 'No existe una cuenta con este correo',
  INVALID_PASSWORD: 'Contraseña incorrecta',
};

function loginErrorMessage(error: unknown): string | null {
  if (isNetworkError(error)) {
    return 'Sin conexión: revisa tu internet e inténtalo de nuevo';
  }
  if (error instanceof AxiosError) {
    const data = error.response?.data as { code?: string } | undefined;
    if (data?.code && LOGIN_ERROR_MESSAGES[data.code]) {
      return LOGIN_ERROR_MESSAGES[data.code];
    }
  }
  return null; // fallback: errorMessage generico
}

export function useLogin() {
  const { login } = useAuth();

  const mutation = useMutation<LoginRequest>({
    mutationFn: async (body) => {
      try {
        await login(body);
        haptics.success();
      } catch (e) {
        haptics.error();
        throw e;
      }
    },
    errorMessage: 'No se pudo iniciar sesión',
    getErrorMessage: loginErrorMessage,
  });

  return { submit: mutation.mutate, loading: mutation.loading, error: mutation.error };
}
