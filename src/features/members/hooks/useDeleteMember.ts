import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';

export function useDeleteMember() {
  return useMutation<string, void>({
    mutationFn: (id) => membersService.remove(id),
    errorMessage: 'No se pudo eliminar el miembro',
  });
}
