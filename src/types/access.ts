export interface IAccessLogItem {
  member_name: string;
  granted: boolean;
  reason: string;
  timestamp: string;
}

export interface GetAccessLogQuery {
  limit?: number;
  offset?: number;
}
