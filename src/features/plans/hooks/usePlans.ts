import { useQuery } from '@hooks/useQuery';
import { plansService } from '@api/services';
import type { Plan } from '@app-types/plan';

export function usePlans() {
  return useQuery<Plan[]>({
    queryFn: () => plansService.getAll(),
    errorMessage: 'No se pudo cargar planes',
  });
}
