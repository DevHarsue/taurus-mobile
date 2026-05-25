import { useMutation } from '@hooks/useMutation';
import * as authApi from '@api/auth.api';
import type { ForgotPasswordRequest, ForgotPasswordResponse } from '@app-types/auth';

export function useForgotPassword() {
  return useMutation<ForgotPasswordRequest, ForgotPasswordResponse>({
    mutationFn: (input) => authApi.forgotPassword(input),
    errorMessage: 'No se pudo procesar la solicitud',
  });
}
