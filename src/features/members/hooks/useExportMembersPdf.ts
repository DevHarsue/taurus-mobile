import { useMutation } from '@hooks/useMutation';
import { membersService } from '@api/services';
import { drainPaginated, ReportEmptyError, sharePdf, todayStamp } from '@utils/pdf';
import { buildMembersReportHtml } from '../utils/buildMembersReportHtml';

export interface ExportMembersPdfInput {
  search: string;
  filter: string;
}

/**
 * Exporta el listado de miembros como PDF re-consultando la API con la
 * busqueda y el filtro de estado activos (hasta PDF_MAX_RECORDS registros).
 */
export function useExportMembersPdf() {
  return useMutation<ExportMembersPdfInput, void>({
    mutationFn: async ({ search, filter }) => {
      const { rows, total, truncated } = await drainPaginated((page, limit) =>
        membersService.getAll({
          page,
          limit,
          search: search.trim() || undefined,
          status: filter || undefined,
        }),
      );
      if (rows.length === 0) throw new ReportEmptyError();

      const html = buildMembersReportHtml(rows, { search, filter }, { total, truncated });
      await sharePdf(html, {
        fileName: `miembros_${todayStamp()}.pdf`,
        dialogTitle: 'Listado de Miembros',
      });
    },
    errorMessage: 'No se pudo generar el listado de miembros',
  });
}
