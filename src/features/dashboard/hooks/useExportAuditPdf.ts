import { useMutation } from '@hooks/useMutation';
import { auditService } from '@api/services';
import { drainPaginated, ReportEmptyError, sharePdf, todayStamp } from '@utils/pdf';
import { buildAuditReportHtml } from '../utils/buildAuditReportHtml';
import {
  buildAuditQueryParams,
  type AuditOperationFilter,
  type AuditTableFilter,
} from './useAuditLog';

export interface ExportAuditPdfInput {
  operation: AuditOperationFilter;
  table: AuditTableFilter;
}

/**
 * Exporta el reporte de auditoria como PDF re-consultando la API con los
 * filtros activos (hasta PDF_MAX_RECORDS registros).
 */
export function useExportAuditPdf() {
  return useMutation<ExportAuditPdfInput, void>({
    mutationFn: async (filters) => {
      const params = buildAuditQueryParams(filters.operation, filters.table);
      const { rows, total, truncated } = await drainPaginated((page, limit) =>
        auditService.getLog({ page, limit, ...params }),
      );
      if (rows.length === 0) throw new ReportEmptyError();

      const html = buildAuditReportHtml(rows, filters, { total, truncated });
      await sharePdf(html, {
        fileName: `auditoria_${todayStamp()}.pdf`,
        dialogTitle: 'Reporte de Auditoría',
      });
    },
    errorMessage: 'No se pudo generar el reporte de auditoría',
  });
}
