import { useQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { Subscription } from '@app-types/subscription';

export function useMySubscriptions() {
  return useQuery<Subscription[]>({
    queryFn: async () => {
      const subs = await membersService.getMySubscriptions();
      return subs.sort(
        (a, b) =>
          new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
      );
    },
    deps: [],
    errorMessage: 'No se pudo cargar tu historial de suscripciones',
  });
}
