import { useQuery } from '@hooks/useQuery';
import { accessService } from '@api/services';
import type { IAccessLogItem } from '@app-types/access';

export function useMemberAccessLog(memberId: string, limit = 10) {
  return useQuery<IAccessLogItem[]>({
    queryFn: () => accessService.getLog({ memberId, limit }),
    deps: [memberId, limit],
    enabled: !!memberId,
    errorMessage: 'No se pudo cargar el historial de accesos',
  });
}
