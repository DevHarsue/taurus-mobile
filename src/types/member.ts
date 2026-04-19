import type { IPaginatedResponse } from './api';
import type { Subscription } from './subscription';

// ─── Enums y tipos base ────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'expired' | 'none';

// ─── Request / Response ────────────────────────────────────────────────────

export interface CreateMemberRequest {
  name: string;
  cedula: string;
  email: string;
  phone?: string;
  password?: string;
  fingerprintId?: number;
}

export interface GetMembersQuery {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export type GetMembersResponse = IPaginatedResponse<MemberListItem>;

export interface UpdateMemberRequest {
  name?: string;
  phone?: string;
  email?: string;
}

export interface RenewMemberRequest {
  planId: string;
}

export interface SubscriptionResponse {
  subscription: Subscription;
}

// ─── Respuestas especificas ───────────────────────────────────────────────

export interface MemberCreated {
  id: string;
  name: string;
  cedula: string;
  status: 'expired';
  temporaryPassword?: string;
}

// ─── Entidades ─────────────────────────────────────────────────────────────

export interface MemberListItem {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone?: string;
  fingerprintId?: number | null;
  subscriptionStatus: MemberStatus;
  daysLeft: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberDetail {
  id: string;
  name: string;
  cedula: string;
  phone?: string;
  email?: string;
  subscriptionStatus: MemberStatus;
  daysLeft: number;
  fingerprintId?: number | null;
}


