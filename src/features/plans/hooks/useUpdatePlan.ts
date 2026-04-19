import { useMutation } from '@hooks/useMutation';
import { plansService } from '@api/services';
import type { UpdatePlanRequest, PlanBase } from '@app-types/plan';

interface IUpdatePlanInput {
  id: string;
  body: UpdatePlanRequest;
}

export function useUpdatePlan() {
  return useMutation<IUpdatePlanInput, PlanBase>({
    mutationFn: ({ id, body }) => plansService.update(id, body),
    errorMessage: 'No se pudo actualizar el plan',
  });
}
