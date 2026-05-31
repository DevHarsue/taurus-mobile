export function formatDateSpanish(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('es', { month: 'long' })
    .format(date)
    .toUpperCase();
}

export function calculateDurationDays(startsAt: string, expiresAt: string): number {
  const start = new Date(startsAt);
  const end = new Date(expiresAt);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function formatDuration(days: number): string {
  if (days >= 365) return `${Math.round(days / 30)} Meses`;
  if (days >= 28 && days % 30 <= 5) return `${Math.round(days / 30)} ${Math.round(days / 30) === 1 ? 'Mes' : 'Meses'}`;
  return `${days} Dias`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based (Mon=0, Tue=1, ..., Sun=6)
  return day === 0 ? 6 : day - 1;
}

export function formatIsoDate(iso: string): string {
  return formatDateSpanish(iso);
}

/**
 * Formato relativo corto para timestamps:
 * < 1 min  → "Ahora"
 * < 60 min → "Hace N min"
 * < 24 h   → "Hace Nh"
 * resto    → "DD MMM HH:MM"
 */
export function formatRelativeTime(timestamp: string): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return d.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Fecha + hora completa con segundos. Usado en detalle de auditoria. */
export function formatFullTimestamp(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
