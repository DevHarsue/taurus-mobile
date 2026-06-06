import { useMutation } from '@hooks/useMutation';
import type { IAuditLogDetail } from '@app-types/audit';
import { sharePdf } from '@utils/pdf';
import { buildAuditDetailReportHtml } from '../utils/buildAuditDetailReportHtml';

/**
 * Exporta el detalle de una entrada de auditoria (con diff antes/despues)
 * como PDF. No re-consulta: usa el detalle ya cargado en pantalla.
 */
export function useExportAuditDetailPdf() {
  return useMutation<IAuditLogDetail, void>({
    mutationFn: async (detail) => {
      const html = buildAuditDetailReportHtml(detail);
      await sharePdf(html, {
        fileName: `auditoria_detalle_${detail.id.replace(/-/g, '').slice(0, 8)}.pdf`,
        dialogTitle: 'Detalle de Auditoría',
      });
    },
    errorMessage: 'No se pudo generar el PDF del detalle',
  });
}
