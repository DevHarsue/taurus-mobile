import { BaseApiService } from './BaseApiService';
import type { IAccessLogItem, GetAccessLogQuery } from '@app-types/access';

export class AccessService extends BaseApiService {
  async getLog(query?: GetAccessLogQuery): Promise<IAccessLogItem[]> {
    return this.get('/api/access/log', query as Record<string, unknown>);
  }
}
