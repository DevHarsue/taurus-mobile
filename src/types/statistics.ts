// ─── Members Statistics ────────────────────────────────────────────────────

export interface IMembersStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  newMembersThisMonth: number;
  newMembersLastMonth: number;
}

export interface IPlanDistribution {
  planId: string;
  planName: string;
  count: number;
}

export interface ISubscriptionsStats {
  totalActive: number;
  totalExpired: number;
  totalCancelled: number;
  expiringIn7Days: number;
  planDistribution: IPlanDistribution[];
}

export interface IRevenueByPlan {
  planId: string;
  planName: string;
  subscriptionCount: number;
  estimatedRevenue: number;
}

export interface IRevenueStats {
  estimatedThisMonth: number;
  estimatedLastMonth: number;
  revenueByPlan: IRevenueByPlan[];
}

export interface IRenewalsStats {
  totalRenewals: number;
  renewalsThisMonth: number;
  renewalsLastMonth: number;
}

export interface IDashboardStatistics {
  members: IMembersStats;
  subscriptions: ISubscriptionsStats;
  revenue: IRevenueStats;
  renewals: IRenewalsStats;
}

// ─── Access Statistics ─────────────────────────────────────────────────────

export interface IAccessOverview {
  totalAccessToday: number;
  totalAccessThisWeek: number;
  totalAccessThisMonth: number;
  deniedToday: number;
  denialRate: number;
}

export interface IHourlyAccess {
  hour: number;
  count: number;
}

export interface IDailyAccess {
  dayOfWeek: number;
  dayName: string;
  count: number;
}

export interface ITopMember {
  memberId: string;
  memberName: string;
  visitCount: number;
}

export interface IDenialBreakdown {
  reason: string;
  count: number;
}

export interface IAccessDashboard {
  overview: IAccessOverview;
  hourly: IHourlyAccess[];
  daily: IDailyAccess[];
  topMembers: ITopMember[];
  denials: IDenialBreakdown[];
}
