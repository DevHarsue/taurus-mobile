import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import type { SubscriptionResponse } from '@app-types/member';
import { runOrEnqueue, type OfflineOutcome } from '@offline';

interface IRenewInput {
  memberId: string;
  planId: string;
  /** Nombre del miembro para el label de la cola de pendientes. */
  memberName?: string;
}

/**
 * Renovacion offline-aware: online ejecuta con Idempotency-Key; sin
 * conexion la encola en el buffer y devuelve `queued: true` para que la
 * pantalla informe "se sincronizara".
 */
export function useRenew() {
  return useMutation<IRenewInput, OfflineOutcome<SubscriptionResponse>>({
    mutationFn: ({ memberId, planId, memberName }) =>
      runOrEnqueue({
        type: 'members.renew',
        payload: { memberId, body: { planId } },
        label: memberName
          ? `Renovar membresía de ${memberName}`
          : 'Renovar membresía',
        run: (key) =>
          membersService.renew(memberId, { planId }, { idempotencyKey: key }),
        optimistic: () => ({
          subscription: {
            id: `pending-${memberId}`,
            memberId,
            planId,
            status: 'active' as const,
            startsAt: new Date().toISOString(),
            expiresAt: new Date().toISOString(),
          },
        }),
      }),
    errorMessage: 'No se pudo renovar',
  });
}
