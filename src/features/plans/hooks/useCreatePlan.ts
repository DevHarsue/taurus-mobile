import { useMutation } from '@hooks/useMutation';
import { plansService } from '@api/services';
import type { CreatePlanRequest, PlanBase } from '@app-types/plan';

export function useCreatePlan() {
  return useMutation<CreatePlanRequest, PlanBase>({
    mutationFn: (body) => plansService.create(body),
    errorMessage: 'No se pudo crear el plan',
  });
}
