import { useQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { MemberDetail } from '@app-types/member';

export function useMemberDetail(id: string) {
  return useQuery<MemberDetail>({
    queryFn: () => membersService.getById(id),
    deps: [id],
    errorMessage: 'No se pudo cargar el miembro',
  });
}
