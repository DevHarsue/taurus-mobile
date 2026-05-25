import { useQuery } from '@hooks/useQuery';
import { accessService } from '@api/services';
import { useMyMemberDetail } from '@features/members/hooks/useMyMemberDetail';
import type { IAccessLogItem } from '@app-types/access';

export function useMyAccessLog() {
  const { data: myMember } = useMyMemberDetail();
  const memberId = myMember?.id;

  return useQuery<IAccessLogItem[]>({
    queryFn: () => accessService.getLog({ limit: 365, memberId }),
    deps: [memberId],
    enabled: !!memberId,
    errorMessage: 'No se pudo cargar tu historial de acceso',
  });
}
