import { useQuery } from '@hooks/useQuery';
import { statisticsService, accessService } from '@api/services';
import type { IDashboardStatistics, IAccessDashboard } from '@app-types/statistics';

export function useDashboardStatistics() {
  return useQuery<IDashboardStatistics>({
    queryFn: () => statisticsService.getDashboard(),
    errorMessage: 'No se pudieron cargar las estadisticas',
    cacheKey: 'statistics:dashboard',
  });
}

export function useAccessStatistics() {
  return useQuery<IAccessDashboard>({
    queryFn: () => accessService.getStatisticsDashboard(),
    errorMessage: 'No se pudieron cargar las estadisticas de acceso',
    cacheKey: 'statistics:access',
  });
}
