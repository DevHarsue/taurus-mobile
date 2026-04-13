import { membersClient } from '@api/index';
import type { Plan } from '@app-types/plan';

export async function getPlans(): Promise<Plan[]> {
  const resp = await membersClient.get<Plan[]>('/api/plans');
  return resp.data;
}