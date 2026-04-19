import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import type { UpdateMemberRequest, MemberDetail } from '@app-types/member';

interface IUpdateMemberInput {
  id: string;
  body: UpdateMemberRequest;
}

export function useUpdateMember() {
  return useMutation<IUpdateMemberInput, MemberDetail>({
    mutationFn: ({ id, body }) => membersService.update(id, body),
    errorMessage: 'No se pudo actualizar el miembro',
  });
}
