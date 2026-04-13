import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import type { SubscriptionResponse } from '@app-types/member';

interface IRenewInput {
  memberId: string;
  planId: string;
}

export function useRenew() {
  return useMutation<IRenewInput, SubscriptionResponse>({
    mutationFn: ({ memberId, planId }) =>
      membersService.renew(memberId, { planId }),
    errorMessage: 'No se pudo renovar',
  });
}
