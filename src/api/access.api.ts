import { accessClient } from '@api/index';
import type { IAccessLogItem } from '@app-types/access';

export interface GetAccessLogQuery {
  limit?: number;
  offset?: number;
}

export async function getAccessLog(query: GetAccessLogQuery): Promise<IAccessLogItem[]> {
  const resp = await accessClient.get<IAccessLogItem[]>('/api/access/log', { params: query });
  return resp.data;
}