export interface IAccessLogItem {
  id: string;
  memberName: string;
  memberId: string;
  granted: boolean;
  reason: string;
  timestamp: string;
  planName?: string;
}

export interface GetAccessLogQuery {
  limit?: number;
  offset?: number;
}
