import { useMutation } from '@hooks/useMutation';
import * as authApi from '@api/auth.api';
import type { ChangePasswordRequest, ChangePasswordResponse } from '@app-types/auth';

export function useChangePassword() {
  return useMutation<ChangePasswordRequest, ChangePasswordResponse>({
    mutationFn: (input) => authApi.changePassword(input),
    errorMessage: 'No se pudo cambiar la contraseña',
  });
}
