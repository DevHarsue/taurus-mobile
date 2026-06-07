import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import type { CreateMemberRequest, MemberCreated } from '@app-types/member';
import { newTempId, runOrEnqueue, type OfflineOutcome } from '@offline';
import type { CreateMemberFormValues } from '../schemas/createMember.schema';

/**
 * Creacion offline-aware: sin conexion encola la operacion y devuelve un
 * MemberCreated con id temporal (`temp:<uuid>`). Regla v1: sobre un id
 * temporal NO se pueden encadenar otras operaciones (p.ej. renovar) hasta
 * que el miembro se sincronice.
 */
export function useCreateMember() {
  return useMutation<CreateMemberFormValues, OfflineOutcome<MemberCreated>>({
    mutationFn: (form) => {
      const body: CreateMemberRequest = {
        name: form.name,
        cedula: form.cedula,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password || undefined,
        fingerprintId: form.fingerprintId
          ? Number(form.fingerprintId)
          : undefined,
      };
      return runOrEnqueue({
        type: 'members.create',
        payload: body,
        label: `Crear miembro ${body.name}`,
        run: (key) => membersService.create(body, { idempotencyKey: key }),
        optimistic: () => ({
          id: newTempId(),
          name: body.name,
          cedula: body.cedula,
          status: 'expired' as const,
        }),
      });
    },
    errorMessage: 'No se pudo registrar el miembro',
  });
}
