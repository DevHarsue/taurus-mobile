import { useMutation } from '@hooks/useMutation';
import * as authApi from '@api/auth.api';
import type { RegisterResponse } from '@app-types/auth';

export function useRegister() {
  return useMutation<{ email: string; password: string }, RegisterResponse>({
    mutationFn: (input) => authApi.publicRegister(input),
    errorMessage: 'No se pudo crear la cuenta',
  });
}
