import { useMutation } from '@hooks/useMutation';
import {
  accessService,
  membersService,
  plansService,
  subscriptionsService,
} from '@api/services';
import { sharePdf } from '@utils/pdf';
import { buildMemberDossierHtml } from '../utils/buildMemberDossierHtml';

/**
 * Exporta el expediente completo de un miembro como PDF. Re-consulta perfil,
 * suscripciones y accesos (hasta 100) para tener datos frescos, mas el
 * catalogo de planes para mostrar nombres en vez de IDs.
 */
export function useExportMemberDossierPdf() {
  return useMutation<{ id: string }, void>({
    mutationFn: async ({ id }) => {
      const [member, allSubscriptions, accessLog, plans] = await Promise.all([
        membersService.getById(id),
        subscriptionsService.getAll(),
        accessService.getLog({ memberId: id, limit: 100 }),
        plansService.getAll(),
      ]);

      const subscriptions = allSubscriptions.filter((s) => s.memberId === id);
      const planNameById = Object.fromEntries(plans.map((p) => [p.id, p.name]));

      const html = buildMemberDossierHtml(member, subscriptions, accessLog, planNameById);
      await sharePdf(html, {
        fileName: `expediente_${(member.cedula ?? member.id.slice(0, 8)).replace(/\s+/g, '')}.pdf`,
        dialogTitle: `Expediente · ${member.name}`,
      });
    },
    errorMessage: 'No se pudo generar el expediente',
  });
}
