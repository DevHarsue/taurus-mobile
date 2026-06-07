import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import { runOrEnqueue, type OfflineOutcome } from '@offline';

interface IDeleteMemberInput {
  id: string;
  /** Nombre para el label de la cola de pendientes. */
  name?: string;
}

/** Eliminacion offline-aware: sin conexion se encola y sincroniza despues. */
export function useDeleteMember() {
  return useMutation<IDeleteMemberInput, OfflineOutcome<void>>({
    mutationFn: ({ id, name }) =>
      runOrEnqueue({
        type: 'members.delete',
        payload: { memberId: id },
        label: name ? `Eliminar miembro ${name}` : 'Eliminar miembro',
        run: (key) => membersService.remove(id, { idempotencyKey: key }),
        optimistic: () => undefined,
      }),
    errorMessage: 'No se pudo eliminar el miembro',
  });
}
