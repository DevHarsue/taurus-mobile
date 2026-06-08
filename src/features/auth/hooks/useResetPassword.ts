import { useMutation } from '@hooks/useMutation';
import * as authApi from '@api/auth.api';
import type { ResetPasswordRequest, ResetPasswordResponse } from '@app-types/auth';

export function useResetPassword() {
  return useMutation<ResetPasswordRequest, ResetPasswordResponse>({
    mutationFn: (input) => authApi.resetPassword(input),
    errorMessage: 'No se pudo restablecer la contraseña',
  });
}
