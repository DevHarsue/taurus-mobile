import { useMutation } from '@hooks/useMutation';
import { useAuth } from '@hooks/useAuth';
import { haptics } from '@utils/haptics';
import type { LoginRequest } from '@app-types/auth';

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
    errorMessage: 'No se pudo iniciar sesion',
  });

  return { submit: mutation.mutate, loading: mutation.loading, error: mutation.error };
}
