import type { AuditOperation, IAuditLogDetail } from '@app-types/audit';
import { formatFullTimestamp } from '@utils/dates';
import {
  escapeHtml,
  reportShell,
  renderSection,
  renderTable,
  statusBadge,
  type ReportColumn,
} from '@utils/pdf';
import {
  fieldLabel,
  formatAuditValue,
  operationDescriptor,
  shortRowId,
  tableLabel,
} from './auditLabels';

interface DiffRow {
  field: string;
  before?: unknown;
  after?: unknown;
  mode: 'created' | 'deleted' | 'changed';
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'object' && typeof b === 'object') {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

/** Misma logica de diff que el componente AuditDiff de la app. */
function buildDiffRows(detail: IAuditLogDetail): DiffRow[] {
  const { operation, oldData, newData } = detail;
  if (operation === 'INSERT') {
    const data = newData ?? {};
    return Object.keys(data).map((field) => ({
      field,
      after: data[field],
      mode: 'created' as const,
    }));
  }
  if (operation === 'DELETE') {
    const data = oldData ?? {};
    return Object.keys(data).map((field) => ({
      field,
      before: data[field],
      mode: 'deleted' as const,
    }));
  }
  const before = oldData ?? {};
  const after = newData ?? {};
  const fields = new Set<string>([
    ...Object.keys(before),
    ...Object.keys(after),
  ]);
  const rows: DiffRow[] = [];
  fields.forEach((field) => {
    if (!deepEqual(before[field], after[field])) {
      rows.push({ field, before: before[field], after: after[field], mode: 'changed' });
    }
  });
  return rows;
}

const DIFF_SECTION_TITLE: Record<AuditOperation, string> = {
  INSERT: 'Campos creados',
  DELETE: 'Campos eliminados',
  UPDATE: 'Campos modificados',
};

const DIFF_COLUMNS: ReportColumn<DiffRow>[] = [
  {
    header: 'Campo',
    width: '28%',
    render: (row) => escapeHtml(fieldLabel(row.field)),
  },
  {
    header: 'Antes',
    width: '36%',
    render: (row) =>
      row.mode === 'created'
        ? '<span class="muted">—</span>'
        : `<span class="muted" style="text-decoration:line-through;">${escapeHtml(formatAuditValue(row.before))}</span>`,
  },
  {
    header: 'Después',
    width: '36%',
    render: (row) =>
      row.mode === 'deleted'
        ? '<span class="muted">—</span>'
        : `<strong>${escapeHtml(formatAuditValue(row.after))}</strong>`,
  },
];

export function buildAuditDetailReportHtml(detail: IAuditLogDetail): string {
  const op = operationDescriptor(detail.operation);
  const entity = tableLabel(detail.tableSchema, detail.tableName);
  const actor = detail.actorEmail ?? 'Sistema';
  const diffRows = buildDiffRows(detail);

  const headerHtml = `
    <table class="report-table">
      <tbody>
        <tr><td style="width:28%;"><strong>Operación</strong></td><td>${statusBadge(op.label, op.badgeVariant)}</td></tr>
        <tr><td><strong>Entidad</strong></td><td>${escapeHtml(entity)}</td></tr>
        <tr><td><strong>Actor</strong></td><td>${escapeHtml(actor)}</td></tr>
        <tr><td><strong>Fecha</strong></td><td>${escapeHtml(formatFullTimestamp(detail.changedAt))}</td></tr>
        <tr><td><strong>ID de fila</strong></td><td>${escapeHtml(shortRowId(detail.rowId))}</td></tr>
        <tr><td><strong>Entrada #</strong></td><td>${escapeHtml(detail.id)}</td></tr>
      </tbody>
    </table>`;

  const diffHtml =
    diffRows.length === 0
      ? '<p class="muted">Sin cambios registrados</p>'
      : renderTable(diffRows, DIFF_COLUMNS);

  return reportShell({
    title: 'Detalle de Auditoría',
    subtitle: `${op.label} · ${entity} · ${actor}`,
    bodyHtml:
      renderSection('Información del evento', headerHtml) +
      renderSection(DIFF_SECTION_TITLE[detail.operation], diffHtml),
  });
}
