import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import type { CreateMemberRequest, MemberCreated } from '@app-types/member';
import type { CreateMemberFormValues } from '../schemas/createMember.schema';

export function useCreateMember() {
  return useMutation<CreateMemberFormValues, MemberCreated>({
    mutationFn: (form) => {
      const body: CreateMemberRequest = {
        name: form.name,
        cedula: form.cedula,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password || undefined,
        fingerprintId: form.fingerprintId
          ? Number(form.fingerprintId)
          : undefined,
      };
      return membersService.create(body);
    },
    errorMessage: 'No se pudo registrar el miembro',
  });
}
