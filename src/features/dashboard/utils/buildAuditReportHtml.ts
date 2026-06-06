import type { IAuditLogItem } from '@app-types/audit';
import {
  escapeHtml,
  formatReportDateTime,
  reportShell,
  renderTable,
  statusBadge,
  type ReportColumn,
} from '@utils/pdf';
import type {
  AuditOperationFilter,
  AuditTableFilter,
} from '../hooks/useAuditLog';
import { operationDescriptor, shortRowId, tableLabel } from './auditLabels';

const OPERATION_FILTER_LABELS: Record<AuditOperationFilter, string> = {
  all: 'Todas',
  INSERT: 'Creados',
  UPDATE: 'Modificados',
  DELETE: 'Eliminados',
};

const TABLE_FILTER_LABELS: Record<AuditTableFilter, string> = {
  all: 'Todas',
  members: 'Miembros',
  membership_plans: 'Planes',
  subscriptions: 'Suscripciones',
  renewals: 'Renovaciones',
  devices: 'Dispositivos',
  users: 'Usuarios',
};

const COLUMNS: ReportColumn<IAuditLogItem>[] = [
  {
    header: 'Fecha',
    width: '18%',
    render: (row) => escapeHtml(formatReportDateTime(row.changedAt)),
  },
  {
    header: 'Operación',
    width: '14%',
    render: (row) => {
      const op = operationDescriptor(row.operation);
      return statusBadge(op.label, op.badgeVariant);
    },
  },
  {
    header: 'Entidad',
    width: '16%',
    render: (row) => escapeHtml(tableLabel(row.tableSchema, row.tableName)),
  },
  {
    header: 'ID fila',
    width: '14%',
    render: (row) => escapeHtml(shortRowId(row.rowId)),
  },
  {
    header: 'Actor',
    render: (row) => escapeHtml(row.actorEmail ?? 'Sistema'),
  },
];

export function buildAuditReportHtml(
  rows: IAuditLogItem[],
  filters: { operation: AuditOperationFilter; table: AuditTableFilter },
  meta: { total: number; truncated: boolean },
): string {
  const subtitle = `Operación: ${OPERATION_FILTER_LABELS[filters.operation]} · Tabla: ${TABLE_FILTER_LABELS[filters.table]} · ${meta.total.toLocaleString('es-VE')} registro(s)`;

  return reportShell({
    title: 'Reporte de Auditoría',
    subtitle,
    meta: meta.truncated
      ? `Mostrando los primeros ${rows.length.toLocaleString('es-VE')} de ${meta.total.toLocaleString('es-VE')} registros`
      : undefined,
    bodyHtml: renderTable(rows, COLUMNS),
  });
}
