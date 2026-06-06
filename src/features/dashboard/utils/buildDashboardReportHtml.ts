import type {
  IAccessDashboard,
  IDashboardStatistics,
  IDenialBreakdown,
  IPlanDistribution,
  IRevenueByPlan,
  ITopMember,
} from '@app-types/statistics';
import {
  escapeHtml,
  formatCurrencyReport,
  reportShell,
  renderSection,
  renderTable,
  type ReportColumn,
} from '@utils/pdf';

/** Mismo mapeo de motivos que AccessLogItem. */
const REASON_LABELS: Record<string, string> = {
  expired: 'Suscripción vencida',
  not_found: 'No encontrado',
};

function growthText(current: number, previous: number): string {
  if (previous === 0 && current === 0) return '—';
  const pct =
    previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct}% vs mes anterior`;
}

function kpiCard(label: string, value: string, note?: string): string {
  return `<div class="kpi">
    <div class="kpi-label">${escapeHtml(label)}</div>
    <div class="kpi-value">${escapeHtml(value)}</div>
    ${note ? `<div class="kpi-note">${escapeHtml(note)}</div>` : ''}
  </div>`;
}

const KPI_GRID_STYLE = `
<style>
    .kpi-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 4px;
    }
    .kpi {
        flex: 1 1 22%;
        min-width: 110px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 8px 10px;
        page-break-inside: avoid;
    }
    .kpi-label {
        font-size: 7.5px; font-weight: 700;
        letter-spacing: 1.2px; color: #6b7280;
        text-transform: uppercase;
        margin-bottom: 3px;
    }
    .kpi-value {
        font-family: 'Lexend', sans-serif;
        font-size: 17px; font-weight: 800;
        color: #930303;
    }
    .kpi-note { font-size: 8px; color: #6b7280; margin-top: 2px; }
</style>`;

const REVENUE_COLUMNS: ReportColumn<IRevenueByPlan>[] = [
  { header: 'Plan', render: (r) => escapeHtml(r.planName) },
  {
    header: 'Suscripciones',
    width: '22%',
    align: 'right',
    render: (r) => String(r.subscriptionCount),
  },
  {
    header: 'Ingreso estimado',
    width: '26%',
    align: 'right',
    render: (r) => escapeHtml(formatCurrencyReport(r.estimatedRevenue)),
  },
];

const PLAN_DIST_COLUMNS: ReportColumn<IPlanDistribution>[] = [
  { header: 'Plan', render: (r) => escapeHtml(r.planName) },
  {
    header: 'Miembros',
    width: '24%',
    align: 'right',
    render: (r) => String(r.count),
  },
];

const TOP_MEMBERS_COLUMNS: ReportColumn<ITopMember & { rank: number }>[] = [
  { header: '#', width: '8%', align: 'center', render: (r) => String(r.rank) },
  { header: 'Miembro', render: (r) => escapeHtml(r.memberName) },
  {
    header: 'Visitas',
    width: '20%',
    align: 'right',
    render: (r) => String(r.visitCount),
  },
];

const DENIAL_COLUMNS: ReportColumn<IDenialBreakdown>[] = [
  {
    header: 'Motivo',
    render: (r) => escapeHtml(REASON_LABELS[r.reason] ?? r.reason),
  },
  {
    header: 'Cantidad',
    width: '24%',
    align: 'right',
    render: (r) => String(r.count),
  },
];

export function buildDashboardReportHtml(
  stats: IDashboardStatistics,
  access: IAccessDashboard,
): string {
  const { members, subscriptions, revenue, renewals } = stats;
  const { overview } = access;

  const kpisHtml = `${KPI_GRID_STYLE}
  <div class="kpi-grid">
    ${kpiCard('Miembros totales', String(members.totalMembers), growthText(members.newMembersThisMonth, members.newMembersLastMonth))}
    ${kpiCard('Miembros activos', String(members.activeMembers))}
    ${kpiCard('Miembros inactivos', String(members.inactiveMembers))}
    ${kpiCard('Nuevos este mes', String(members.newMembersThisMonth))}
  </div>
  <div class="kpi-grid">
    ${kpiCard('Ingresos este mes', formatCurrencyReport(revenue.estimatedThisMonth), growthText(revenue.estimatedThisMonth, revenue.estimatedLastMonth))}
    ${kpiCard('Renovaciones este mes', String(renewals.renewalsThisMonth), growthText(renewals.renewalsThisMonth, renewals.renewalsLastMonth))}
    ${kpiCard('Accesos hoy', String(overview.totalAccessToday))}
    ${kpiCard('Accesos este mes', String(overview.totalAccessThisMonth), `Semana: ${overview.totalAccessThisWeek}`)}
  </div>
  <div class="kpi-grid">
    ${kpiCard('Suscripciones activas', String(subscriptions.totalActive))}
    ${kpiCard('Vencidas', String(subscriptions.totalExpired))}
    ${kpiCard('Vencen en 7 días', String(subscriptions.expiringIn7Days))}
    ${kpiCard('Tasa de denegación', `${overview.denialRate}%`, `Denegados hoy: ${overview.deniedToday}`)}
  </div>`;

  const sections = [
    renderSection('Indicadores generales', kpisHtml),
    renderSection(
      'Ingresos por plan',
      revenue.revenueByPlan.length > 0
        ? renderTable(revenue.revenueByPlan, REVENUE_COLUMNS)
        : '<p class="muted">Sin datos de ingresos</p>',
    ),
    renderSection(
      'Distribución de planes',
      subscriptions.planDistribution.length > 0
        ? renderTable(subscriptions.planDistribution, PLAN_DIST_COLUMNS)
        : '<p class="muted">Sin suscripciones registradas</p>',
    ),
    renderSection(
      'Top miembros (últimos 30 días)',
      access.topMembers.length > 0
        ? renderTable(
            access.topMembers.map((m, i) => ({ ...m, rank: i + 1 })),
            TOP_MEMBERS_COLUMNS,
          )
        : '<p class="muted">Sin visitas registradas</p>',
    ),
    renderSection(
      'Razones de denegación (últimos 30 días)',
      access.denials.length > 0
        ? renderTable(access.denials, DENIAL_COLUMNS)
        : '<p class="muted">Sin accesos denegados</p>',
    ),
  ];

  return reportShell({
    title: 'Reporte Ejecutivo',
    subtitle: 'Resumen general de miembros, ingresos, suscripciones y accesos',
    bodyHtml: sections.join('\n'),
  });
}
