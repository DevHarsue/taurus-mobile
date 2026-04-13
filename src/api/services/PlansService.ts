import { BaseApiService } from './BaseApiService';
import type { Plan } from '@app-types/plan';

export class PlansService extends BaseApiService {
  async getAll(): Promise<Plan[]> {
    return this.get('/api/plans');
  }
}
