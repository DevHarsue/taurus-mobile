import type { IAccessLogItem } from '@app-types/access';
import type { MemberDetail, MemberStatus } from '@app-types/member';
import type { Subscription, SubscriptionStatus } from '@app-types/subscription';
import {
  escapeHtml,
  formatReportDate,
  formatReportDateTime,
  reportShell,
  renderSection,
  renderTable,
  statusBadge,
  type BadgeVariant,
  type ReportColumn,
} from '@utils/pdf';

const MEMBER_STATUS: Record<MemberStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Activo', variant: 'active' },
  expired: { label: 'Vencido', variant: 'expired' },
  none: { label: 'Sin plan', variant: 'neutral' },
};

const SUB_STATUS: Record<SubscriptionStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Activa', variant: 'active' },
  expired: { label: 'Vencida', variant: 'expired' },
  cancelled: { label: 'Cancelada', variant: 'neutral' },
};

/** Mismo mapeo de motivos que AccessLogItem. */
const REASON_LABELS: Record<string, string> = {
  expired: 'Suscripción vencida',
  not_found: 'No encontrado',
  active: '',
};

const ACCESS_COLUMNS: ReportColumn<IAccessLogItem>[] = [
  {
    header: 'Fecha / Hora',
    width: '28%',
    render: (row) => escapeHtml(formatReportDateTime(row.timestamp)),
  },
  {
    header: 'Resultado',
    width: '22%',
    render: (row) =>
      row.granted
        ? statusBadge('Concedido', 'active')
        : statusBadge('Denegado', 'expired'),
  },
  {
    header: 'Motivo',
    render: (row) => {
      if (row.granted) return '<span class="muted">—</span>';
      const label = REASON_LABELS[row.reason] ?? row.reason;
      return escapeHtml(label || '—');
    },
  },
];

function profileRow(label: string, valueHtml: string): string {
  return `<tr><td style="width:28%;"><strong>${escapeHtml(label)}</strong></td><td>${valueHtml}</td></tr>`;
}

export function buildMemberDossierHtml(
  member: MemberDetail,
  subscriptions: Subscription[],
  accessLog: IAccessLogItem[],
  planNameById: Record<string, string>,
): string {
  const status = MEMBER_STATUS[member.subscriptionStatus];

  const subColumns: ReportColumn<Subscription>[] = [
    {
      header: 'Plan',
      render: (row) => escapeHtml(planNameById[row.planId] ?? row.planId.slice(0, 8) + '…'),
    },
    {
      header: 'Estado',
      width: '18%',
      render: (row) => {
        const info = SUB_STATUS[row.status];
        return statusBadge(info.label, info.variant);
      },
    },
    {
      header: 'Inicio',
      width: '20%',
      render: (row) => escapeHtml(formatReportDate(row.startsAt)),
    },
    {
      header: 'Vence',
      width: '20%',
      render: (row) => escapeHtml(formatReportDate(row.expiresAt)),
    },
  ];

  const profileHtml = `<table class="report-table"><tbody>
    ${profileRow('Nombre', `<strong>${escapeHtml(member.name)}</strong>`)}
    ${profileRow('Cédula', escapeHtml(member.cedula ?? '—'))}
    ${profileRow('Email', escapeHtml(member.email ?? '—'))}
    ${profileRow('Teléfono', escapeHtml(member.phone ?? '—'))}
    ${profileRow('Estado', statusBadge(status.label, status.variant))}
    ${profileRow('Plan actual', escapeHtml(member.currentPlanName ?? '—'))}
    ${profileRow('Vence', escapeHtml(formatReportDate(member.currentExpiresAt)))}
    ${profileRow('Días restantes', member.subscriptionStatus === 'none' ? '—' : String(member.daysLeft))}
    ${profileRow('Miembro desde', escapeHtml(formatReportDate(member.createdAt)))}
  </tbody></table>`;

  const sortedSubs = [...subscriptions].sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );

  const sections = [
    renderSection('Perfil', profileHtml),
    renderSection(
      'Historial de suscripciones',
      sortedSubs.length > 0
        ? renderTable(sortedSubs, subColumns)
        : '<p class="muted">Sin suscripciones registradas</p>',
    ),
    renderSection(
      `Últimos accesos (${accessLog.length})`,
      accessLog.length > 0
        ? renderTable(accessLog, ACCESS_COLUMNS)
        : '<p class="muted">Sin accesos registrados</p>',
    ),
  ];

  return reportShell({
    title: 'Expediente de Miembro',
    subtitle: `${member.name} · ${member.cedula ?? 'Sin cédula'}`,
    bodyHtml: sections.join('\n'),
  });
}
