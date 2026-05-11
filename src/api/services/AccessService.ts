import { BaseApiService } from './BaseApiService';
import type { IAccessLogItem, GetAccessLogQuery } from '@app-types/access';
import type {
  IAccessDashboard,
  IAccessOverview,
  IHourlyAccess,
  IDailyAccess,
  ITopMember,
  IDenialBreakdown,
} from '@app-types/statistics';

export class AccessService extends BaseApiService {
  async getLog(query?: GetAccessLogQuery): Promise<IAccessLogItem[]> {
    return this.get('/api/access/log', query as Record<string, unknown>);
  }

  async getStatisticsDashboard(): Promise<IAccessDashboard> {
    return this.get('/api/access/statistics/dashboard');
  }

  async getOverview(): Promise<IAccessOverview> {
    return this.get('/api/access/statistics/overview');
  }

  async getHourly(days = 30): Promise<IHourlyAccess[]> {
    return this.get('/api/access/statistics/hourly', { days });
  }

  async getDaily(weeks = 4): Promise<IDailyAccess[]> {
    return this.get('/api/access/statistics/daily', { weeks });
  }

  async getTopMembers(limit = 10): Promise<ITopMember[]> {
    return this.get('/api/access/statistics/top-members', { limit });
  }

  async getDenials(days = 30): Promise<IDenialBreakdown[]> {
    return this.get('/api/access/statistics/denials', { days });
  }
}
