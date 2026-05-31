import { useQuery } from '@hooks/useQuery';
import { auditService } from '@api/services';
import type { IAuditLogDetail } from '@app-types/audit';

export function useAuditDetail(id: string) {
  return useQuery<IAuditLogDetail>({
    queryFn: () => auditService.getById(id),
    deps: [id],
    errorMessage: 'No se pudo cargar el detalle de la entrada de auditoria',
  });
}
