import { BaseApiService } from './BaseApiService';
import type {
  IDashboardStatistics,
  IMembersStats,
  ISubscriptionsStats,
  IRevenueStats,
  IRenewalsStats,
} from '@app-types/statistics';

export class StatisticsService extends BaseApiService {
  async getDashboard(): Promise<IDashboardStatistics> {
    return this.get('/api/statistics/dashboard');
  }

  async getMembers(): Promise<IMembersStats> {
    return this.get('/api/statistics/members');
  }

  async getSubscriptions(): Promise<ISubscriptionsStats> {
    return this.get('/api/statistics/subscriptions');
  }

  async getRevenue(): Promise<IRevenueStats> {
    return this.get('/api/statistics/revenue');
  }

  async getRenewals(): Promise<IRenewalsStats> {
    return this.get('/api/statistics/renewals');
  }
}
