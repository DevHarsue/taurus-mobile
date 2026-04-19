import { useMutation } from '@hooks/useMutation';
import { useAuth } from '@hooks/useAuth';
import { membersService } from '@api/services';
import type { CreateMemberRequest, MemberCreated } from '@app-types/member';
import type { CreateMemberFormValues } from '../schemas/createMember.schema';

export function useCreateMember() {
  const { user } = useAuth();

  return useMutation<CreateMemberFormValues, MemberCreated>({
    mutationFn: (form) => {
      const body: CreateMemberRequest = {
        userId: user!.id,
        name: form.name,
        cedula: form.cedula,
        phone: form.phone || undefined,
        email: form.email || undefined,
        fingerprintId: form.fingerprintId
          ? Number(form.fingerprintId)
          : undefined,
      };
      return membersService.create(body);
    },
    errorMessage: 'No se pudo registrar el miembro',
  });
}
