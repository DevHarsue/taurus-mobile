import { BaseApiService } from './BaseApiService';
import type {
  GetAuditLogQuery,
  IAuditLogDetail,
  IAuditLogItem,
} from '@app-types/audit';
import type { IPaginatedResponse } from '@app-types/api';

export class AuditService extends BaseApiService {
  async getLog(
    query?: GetAuditLogQuery,
  ): Promise<IPaginatedResponse<IAuditLogItem>> {
    return this.get('/api/audit/log', query as Record<string, unknown>);
  }

  async getById(id: string): Promise<IAuditLogDetail> {
    return this.get(`/api/audit/log/${id}`);
  }
}
