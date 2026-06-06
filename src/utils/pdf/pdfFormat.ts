/** Helpers puros de formato para los reportes PDF. */

export type BadgeVariant = 'active' | 'expired' | 'neutral' | 'warning';

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

/** Fecha corta es-ES: "06 jun 2026". Devuelve '—' si es invalida. */
export function formatReportDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Fecha + hora es-ES: "06 jun 2026, 14:30". Devuelve '—' si es invalida. */
export function formatReportDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Moneda como en DashboardScreen: "$1.250". */
export function formatCurrencyReport(value: number): string {
  return `$${value.toLocaleString('es-VE')}`;
}

/** Marca AAAA-MM-DD para nombres de archivo. */
export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Pill de estado HTML coherente con los Badge de la app. */
export function statusBadge(label: string, variant: BadgeVariant): string {
  return `<span class="badge badge-${variant}">${escapeHtml(label)}</span>`;
}
