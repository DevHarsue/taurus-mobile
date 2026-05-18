import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import type { CompleteProfileRequest, MemberDetail } from '@app-types/member';

export function useCompleteProfile() {
  return useMutation<CompleteProfileRequest, MemberDetail>({
    mutationFn: (body) => membersService.completeMyProfile(body),
    errorMessage: 'No se pudo completar el perfil',
  });
}
