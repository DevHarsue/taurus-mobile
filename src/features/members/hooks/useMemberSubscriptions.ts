import { useQuery } from '@hooks/useQuery';
import { subscriptionsService } from '@api/services';
import type { Subscription } from '@app-types/subscription';

export function useMemberSubscriptions(memberId: string) {
  return useQuery<Subscription[]>({
    queryFn: async () => {
      const all = await subscriptionsService.getAll();
      return all.filter((s) => s.memberId === memberId);
    },
    deps: [memberId],
    errorMessage: 'No se pudo cargar el historial de suscripciones',
  });
}
