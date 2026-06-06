import { useMutation } from '@hooks/useMutation';
import { accessService, statisticsService } from '@api/services';
import { sharePdf, todayStamp } from '@utils/pdf';
import { buildDashboardReportHtml } from '../utils/buildDashboardReportHtml';

/**
 * Exporta el reporte ejecutivo del dashboard como PDF. Re-consulta los
 * agregados de estadisticas y accesos en paralelo (sin paginacion).
 */
export function useExportDashboardPdf() {
  return useMutation<void, void>({
    mutationFn: async () => {
      const [stats, access] = await Promise.all([
        statisticsService.getDashboard(),
        accessService.getStatisticsDashboard(),
      ]);

      const html = buildDashboardReportHtml(stats, access);
      await sharePdf(html, {
        fileName: `reporte_ejecutivo_${todayStamp()}.pdf`,
        dialogTitle: 'Reporte Ejecutivo',
      });
    },
    errorMessage: 'No se pudo generar el reporte ejecutivo',
  });
}
