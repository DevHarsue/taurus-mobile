import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import type { UpdateMemberRequest, MemberDetail } from '@app-types/member';
import { ReadCache, runOrEnqueue, type OfflineOutcome } from '@offline';

interface IUpdateMemberInput {
  id: string;
  body: UpdateMemberRequest;
}

/** Edicion offline-aware: sin conexion se encola y sincroniza despues. */
export function useUpdateMember() {
  return useMutation<IUpdateMemberInput, OfflineOutcome<MemberDetail>>({
    mutationFn: ({ id, body }) =>
      runOrEnqueue({
        type: 'members.update',
        payload: { memberId: id, body },
        label: `Editar miembro${body.name ? ` ${body.name}` : ''}`,
        run: (key) => membersService.update(id, body, { idempotencyKey: key }),
        optimistic: () => {
          // Mezclar los cambios sobre el detalle cacheado si existe.
          const cached = ReadCache.get<MemberDetail>(`member:${id}`)?.data;
          const optimisticDetail: MemberDetail = {
            id,
            name: body.name ?? cached?.name ?? '',
            cedula: cached?.cedula,
            phone: body.phone ?? cached?.phone,
            email: body.email ?? cached?.email,
            subscriptionStatus: cached?.subscriptionStatus ?? 'none',
            daysLeft: cached?.daysLeft ?? 0,
          };
          return optimisticDetail;
        },
      }),
    errorMessage: 'No se pudo actualizar el miembro',
  });
}
