import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import type { CreateMemberRequest, MemberDetail } from '@app-types/member';
import type { CreateMemberFormValues } from '../schemas/createMember.schema';

function createClientUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function useCreateMember() {
  return useMutation<CreateMemberFormValues, MemberDetail>({
    mutationFn: (values) => {
      const payload: CreateMemberRequest = {
        userId: createClientUuid(),
        name: values.name.trim(),
        cedula: values.cedula.trim(),
        phone: values.phone.trim(),
        email: values.email.trim().toLowerCase(),
      };

      return membersService.create(payload);
    },
    errorMessage: 'No se pudo registrar el miembro',
  });
}
