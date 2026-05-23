import { useQuery } from '@hooks/useQuery';
import { accessService } from '@api/services';
import { useMyMemberDetail } from '@features/members/hooks/useMyMemberDetail';
import type { IAccessLogItem } from '@app-types/access';

export function useMyAccessLog() {
  const { data: myMember } = useMyMemberDetail();
  const memberName = myMember?.name;

  return useQuery<IAccessLogItem[]>({
    queryFn: async () => {
      const log = await accessService.getLog({ limit: 200 });
      if (!memberName) return [];
      return log.filter(
        (item) =>
          item.member_name.toLowerCase() === memberName.toLowerCase() &&
          item.granted,
      );
    },
    deps: [memberName],
    enabled: !!memberName,
    errorMessage: 'No se pudo cargar tu historial de acceso',
  });
}
