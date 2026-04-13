import { useMutation } from '@hooks/useMutation';
import { useAuth } from '@hooks/useAuth';
import type { LoginRequest } from '@app-types/auth';

export function useLogin() {
  const { login } = useAuth();

  const mutation = useMutation<LoginRequest>({
    mutationFn: (body) => login(body),
    errorMessage: 'No se pudo iniciar sesion',
  });

  return { submit: mutation.mutate, loading: mutation.loading, error: mutation.error };
}
