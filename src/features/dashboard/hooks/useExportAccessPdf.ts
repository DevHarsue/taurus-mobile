import { useMutation } from '@hooks/useMutation';
import { accessService } from '@api/services';
import { drainOffset, ReportEmptyError, sharePdf, todayStamp } from '@utils/pdf';
import { buildAccessReportHtml } from '../utils/buildAccessReportHtml';
import type { AccessLogFilter } from './useAccessLog';

/**
 * Exporta el registro de accesos como PDF. Drena el endpoint por offset
 * (hasta PDF_MAX_RECORDS) y aplica el filtro concedido/denegado client-side,
 * igual que useAccessLog (el backend no filtra por `granted`).
 */
export function useExportAccessPdf() {
  return useMutation<AccessLogFilter, void>({
    mutationFn: async (filter) => {
      const { rows, truncated } = await drainOffset((limit, offset) =>
        accessService.getLog({ limit, offset }),
      );

      const filtered =
        filter === 'all'
          ? rows
          : rows.filter((item) => item.granted === (filter === 'granted'));
      if (filtered.length === 0) throw new ReportEmptyError();

      const html = buildAccessReportHtml(filtered, filter, { truncated });
      await sharePdf(html, {
        fileName: `accesos_${todayStamp()}.pdf`,
        dialogTitle: 'Reporte de Accesos',
      });
    },
    errorMessage: 'No se pudo generar el reporte de accesos',
  });
}
