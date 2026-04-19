import { BaseApiService } from './BaseApiService';
import type {
  Plan,
  PlanBase,
  CreatePlanRequest,
  UpdatePlanRequest,
} from '@app-types/plan';

export class PlansService extends BaseApiService {
  async getAll(): Promise<Plan[]> {
    return this.get('/api/plans');
  }

  async getById(id: string): Promise<PlanBase> {
    return this.get(`/api/plans/${id}`);
  }

  async create(body: CreatePlanRequest): Promise<PlanBase> {
    return this.post('/api/plans', body);
  }

  async update(id: string, body: UpdatePlanRequest): Promise<PlanBase> {
    return this.put(`/api/plans/${id}`, body);
  }

  async remove(id: string): Promise<void> {
    return this.delete(`/api/plans/${id}`);
  }
}
