import { useQuery } from '@hooks/useQuery';
import { accessService } from '@api/services';
import type { IAccessLogItem } from '@app-types/access';

export function useDashboard() {
  return useQuery<IAccessLogItem[]>({
    queryFn: () => accessService.getLog({ limit: 50, offset: 0 }),
    errorMessage: 'No se pudo cargar el dashboard',
  });
}
