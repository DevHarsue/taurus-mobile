export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface Subscription {
  id: string;
  memberId: string;
  planId: string;
  status: SubscriptionStatus;
  startsAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
}

export interface CreateSubscriptionRequest {
  memberId: string;
  planId: string;
  startsAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  status?: string;
}
