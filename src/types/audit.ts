export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface IAuditLogItem {
  id: string;
  tableSchema: string;
  tableName: string;
  operation: AuditOperation;
  rowId?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  changedAt: string;
}

export interface IAuditLogDetail extends IAuditLogItem {
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}

export interface GetAuditLogQuery {
  page?: number;
  limit?: number;
  schema?: 'auth' | 'members';
  table?: string;
  operation?: AuditOperation;
  actorId?: string;
  rowId?: string;
  dateFrom?: string;
  dateTo?: string;
}
