import { BaseApiService } from './BaseApiService';
import type {
  Subscription,
  CreateSubscriptionRequest,
} from '@app-types/subscription';

export class SubscriptionsService extends BaseApiService {
  async getAll(): Promise<Subscription[]> {
    return this.get('/api/subscriptions');
  }

  async getById(id: string): Promise<Subscription> {
    return this.get(`/api/subscriptions/${id}`);
  }

  async create(body: CreateSubscriptionRequest): Promise<Subscription> {
    return this.post('/api/subscriptions', body);
  }

  async update(
    id: string,
    body: Partial<Omit<Subscription, 'id'>>,
  ): Promise<Subscription> {
    return this.put(`/api/subscriptions/${id}`, body);
  }

  async remove(id: string): Promise<void> {
    return this.delete(`/api/subscriptions/${id}`);
  }
}
