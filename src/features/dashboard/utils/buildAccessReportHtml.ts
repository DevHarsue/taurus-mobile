import type { IAccessLogItem } from '@app-types/access';
import {
  escapeHtml,
  formatReportDateTime,
  reportShell,
  renderTable,
  statusBadge,
  type ReportColumn,
} from '@utils/pdf';
import type { AccessLogFilter } from '../hooks/useAccessLog';

const FILTER_LABELS: Record<AccessLogFilter, string> = {
  all: 'Todos',
  granted: 'Concedidos',
  denied: 'Denegados',
};

/** Mismo mapeo de motivos que AccessLogItem. */
const REASON_LABELS: Record<string, string> = {
  expired: 'Suscripción vencida',
  not_found: 'No encontrado',
  active: '',
};

const COLUMNS: ReportColumn<IAccessLogItem>[] = [
  {
    header: 'Fecha / Hora',
    width: '22%',
    render: (row) => escapeHtml(formatReportDateTime(row.timestamp)),
  },
  {
    header: 'Miembro',
    render: (row) => escapeHtml(row.member_name),
  },
  {
    header: 'Resultado',
    width: '16%',
    render: (row) =>
      row.granted
        ? statusBadge('Concedido', 'active')
        : statusBadge('Denegado', 'expired'),
  },
  {
    header: 'Motivo',
    width: '24%',
    render: (row) => {
      if (row.granted) return '<span class="muted">—</span>';
      const label = REASON_LABELS[row.reason] ?? row.reason;
      return escapeHtml(label || '—');
    },
  },
];

export function buildAccessReportHtml(
  rows: IAccessLogItem[],
  filter: AccessLogFilter,
  meta: { truncated: boolean },
): string {
  return reportShell({
    title: 'Reporte de Accesos',
    subtitle: `Filtro: ${FILTER_LABELS[filter]} · ${rows.length.toLocaleString('es-VE')} registro(s)`,
    meta: meta.truncated
      ? `Mostrando los primeros ${rows.length.toLocaleString('es-VE')} registros`
      : undefined,
    bodyHtml: renderTable(rows, COLUMNS),
  });
}
