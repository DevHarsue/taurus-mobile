import type { IAccessLogItem } from './access';

export interface ISensorStatus {
  isActive: boolean;
  deviceId: string;
}

export interface IDashboardStats {
  entriesToday: number;
  deltaPercent: number;
  activeMembers: number;
  expiringThisWeek: number;
  expiredMembers: number;
}

export interface IDashboardData {
  sensorStatus: ISensorStatus;
  stats: IDashboardStats;
  recentAccess: IAccessLogItem[];
}
