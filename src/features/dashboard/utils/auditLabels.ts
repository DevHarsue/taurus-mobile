import type { AuditOperation } from '@app-types/audit';

export type AuditBadgeVariant = 'active' | 'expired' | 'neutral' | 'warning';

export interface OperationDescriptor {
  label: string;
  verb: string;
  badgeVariant: AuditBadgeVariant;
}

const OPERATION_MAP: Record<AuditOperation, OperationDescriptor> = {
  INSERT: { label: 'Creado', verb: 'Creo', badgeVariant: 'active' },
  UPDATE: { label: 'Modificado', verb: 'Modifico', badgeVariant: 'neutral' },
  DELETE: { label: 'Eliminado', verb: 'Elimino', badgeVariant: 'expired' },
};

export function operationDescriptor(
  operation: AuditOperation,
): OperationDescriptor {
  return OPERATION_MAP[operation] ?? OPERATION_MAP.UPDATE;
}

const TABLE_LABELS: Record<string, string> = {
  'members.members': 'Miembro',
  'members.membership_plans': 'Plan',
  'members.subscriptions': 'Suscripcion',
  'members.renewals': 'Renovacion',
  'members.devices': 'Dispositivo',
  'auth.users': 'Usuario',
  'auth.refresh_tokens': 'Sesion',
};

export function tableLabel(schema: string, table: string): string {
  const key = `${schema}.${table}`;
  return TABLE_LABELS[key] ?? table;
}

const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  user_id: 'Usuario',
  created_by: 'Creado por',
  name: 'Nombre',
  cedula: 'Cedula',
  phone: 'Telefono',
  email: 'Email',
  role: 'Rol',
  fingerprint_id: 'ID huella',
  duration_days: 'Duracion (dias)',
  reference_price: 'Precio referencia',
  is_active: 'Activo',
  member_id: 'Miembro',
  plan_id: 'Plan',
  status: 'Estado',
  starts_at: 'Inicio',
  expires_at: 'Vencimiento',
  subscription_id: 'Suscripcion',
  renewed_at: 'Renovado el',
  new_expires_at: 'Nuevo vencimiento',
  renewed_by: 'Renovado por',
  device_code: 'Codigo dispositivo',
  location: 'Ubicacion',
  last_seen_at: 'Ultima vez visto',
  created_at: 'Creado el',
  updated_at: 'Actualizado el',
  google_id: 'Google ID',
  token: 'Token',
  expires_at_token: 'Vencimiento token',
};

export function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Si' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (UUID_RE.test(value)) {
      return value.slice(0, 8) + '…';
    }
    if (ISO_DATE_RE.test(value)) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('es', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
    }
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function shortRowId(rowId?: string | null): string {
  if (!rowId) return '—';
  if (UUID_RE.test(rowId)) return rowId.slice(0, 8) + '…';
  return rowId.length > 12 ? rowId.slice(0, 12) + '…' : rowId;
}
