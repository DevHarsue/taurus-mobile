import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import type { CreateMemberRequest, MemberDetail } from '@app-types/member';

export function useCreateMember() {
  return useMutation<CreateMemberRequest, MemberDetail>({
    mutationFn: (body) => membersService.create(body),
    errorMessage: 'No se pudo registrar el miembro',
  });
}
