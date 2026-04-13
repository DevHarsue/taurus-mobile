import { useQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { IRenewalHistoryItem } from '@app-types/member';

export function useRenewalHistory(memberId?: string) {
  return useQuery<IRenewalHistoryItem[]>({
    queryFn: () => membersService.getRenewalHistory(memberId!),
    deps: [memberId],
    // Backend no disponible aun
    enabled: false,
    errorMessage: 'No se pudo cargar el historial',
  });
}
