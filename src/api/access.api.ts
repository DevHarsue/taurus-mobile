import { accessClient } from '@api/index';
import type { AccessLogItem } from '@app-types/access';

export interface GetAccessLogQuery {
  limit?: number;
  offset?: number;
}

export async function getAccessLog(query: GetAccessLogQuery): Promise<AccessLogItem[]> {
  const resp = await accessClient.get<AccessLogItem[]>('/api/access/log', { params: query });
  return resp.data;
}