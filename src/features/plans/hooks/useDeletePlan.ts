import { useMutation } from '@hooks/useMutation';
import { plansService } from '@api/services';

export function useDeletePlan() {
  return useMutation<string, void>({
    mutationFn: (id) => plansService.remove(id),
    errorMessage: 'No se pudo eliminar el plan',
  });
}
