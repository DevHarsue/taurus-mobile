import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@hooks/useQuery';
import { auditService } from '@api/services';
import type {
  AuditOperation,
  GetAuditLogQuery,
  IAuditLogItem,
} from '@app-types/audit';

export type AuditOperationFilter = 'all' | AuditOperation;
export type AuditTableFilter =
  | 'all'
  | 'members'
  | 'membership_plans'
  | 'subscriptions'
  | 'renewals'
  | 'devices'
  | 'users';

const TABLE_SCHEMA: Record<Exclude<AuditTableFilter, 'all'>, 'auth' | 'members'> = {
  members: 'members',
  membership_plans: 'members',
  subscriptions: 'members',
  renewals: 'members',
  devices: 'members',
  users: 'auth',
};

/** Convierte los filtros de UI en query params del endpoint de auditoria. */
export function buildAuditQueryParams(
  operation: AuditOperationFilter,
  table: AuditTableFilter,
): Pick<GetAuditLogQuery, 'operation' | 'table' | 'schema'> {
  const params: Pick<GetAuditLogQuery, 'operation' | 'table' | 'schema'> = {};
  if (operation !== 'all') params.operation = operation;
  if (table !== 'all') {
    params.table = table;
    params.schema = TABLE_SCHEMA[table];
  }
  return params;
}

export function useAuditLog() {
  const [operation, setOperation] = useState<AuditOperationFilter>('all');
  const [table, setTable] = useState<AuditTableFilter>('all');

  const queryParams = useMemo(
    () => buildAuditQueryParams(operation, table),
    [operation, table],
  );

  const result = useInfiniteQuery<IAuditLogItem>({
    queryFn: (page, limit) =>
      auditService.getLog({ page, limit, ...queryParams }),
    limit: 20,
    deps: [operation, table],
    errorMessage: 'No se pudo cargar la auditoria del sistema',
  });

  return {
    ...result,
    operation,
    setOperation,
    table,
    setTable,
  };
}
