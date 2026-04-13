import { usePaginatedQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { GetMembersResponse } from '@app-types/member';

export function useMembers() {
  return usePaginatedQuery<GetMembersResponse>({
    queryFn: (page, limit) => membersService.getAll({ page, limit }),
    errorMessage: 'No se pudo cargar miembros',
  });
}
