import type { MemberListItem, MemberStatus } from '@app-types/member';
import {
  escapeHtml,
  reportShell,
  renderTable,
  statusBadge,
  type BadgeVariant,
  type ReportColumn,
} from '@utils/pdf';

const STATUS_INFO: Record<MemberStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Activo', variant: 'active' },
  expired: { label: 'Vencido', variant: 'expired' },
  none: { label: 'Sin plan', variant: 'neutral' },
};

const FILTER_LABELS: Record<string, string> = {
  '': 'Todos',
  active: 'Activos',
  expired: 'Vencidos',
  none: 'Sin plan',
};

const COLUMNS: ReportColumn<MemberListItem>[] = [
  {
    header: 'Nombre',
    render: (row) => escapeHtml(row.name),
  },
  {
    header: 'Cédula',
    width: '13%',
    render: (row) => escapeHtml(row.cedula || '—'),
  },
  {
    header: 'Email',
    width: '24%',
    render: (row) => escapeHtml(row.email || '—'),
  },
  {
    header: 'Teléfono',
    width: '13%',
    render: (row) => escapeHtml(row.phone ?? '—'),
  },
  {
    header: 'Estado',
    width: '12%',
    render: (row) => {
      const info = STATUS_INFO[row.subscriptionStatus];
      return statusBadge(info.label, info.variant);
    },
  },
  {
    header: 'Días rest.',
    width: '9%',
    align: 'right',
    render: (row) =>
      row.subscriptionStatus === 'none' ? '—' : String(row.daysLeft),
  },
];

export function buildMembersReportHtml(
  rows: MemberListItem[],
  filters: { search: string; filter: string },
  meta: { total: number; truncated: boolean },
): string {
  const parts = [
    `Estado: ${FILTER_LABELS[filters.filter] ?? filters.filter}`,
  ];
  if (filters.search.trim()) {
    parts.push(`Búsqueda: "${filters.search.trim()}"`);
  }
  parts.push(`${meta.total.toLocaleString('es-VE')} miembro(s)`);

  return reportShell({
    title: 'Listado de Miembros',
    subtitle: parts.join(' · '),
    meta: meta.truncated
      ? `Mostrando los primeros ${rows.length.toLocaleString('es-VE')} de ${meta.total.toLocaleString('es-VE')} miembros`
      : undefined,
    bodyHtml: renderTable(rows, COLUMNS),
  });
}
