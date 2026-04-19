import { useQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { MemberStatusResponse } from '@app-types/member';

export function useMemberStatus(id: string) {
  return useQuery<MemberStatusResponse>({
    queryFn: () => membersService.getStatus(id),
    deps: [id],
    errorMessage: 'No se pudo cargar el estado del miembro',
  });
}
