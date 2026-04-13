export type MemberStatus = string;

export interface CreateMemberRequest {
  name: string;
  cedula: string;
  phone: string;
  email: string;
  fingerprint_id: string;
}

export interface CreateMemberResponse {
  id: string;
  name: string;
  cedula: string;
  status: MemberStatus;
  [key: string]: unknown;
}

export interface MemberListItem {
  id: string;
  name: string;
  cedula: string;
  status: MemberStatus;
  [key: string]: unknown;
}

export interface GetMembersQuery {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetMembersResponse {
  data: MemberListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface MemberDetail {
  id: string;
  name: string;
  cedula: string;
  phone: string;
  email: string;
  status: MemberStatus;
  daysLeft: number;
  fingerprintId: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface UpdateMemberRequest {
  name?: string;
  phone?: string;
  email?: string;
}

export interface RenewMemberRequest {
  planId: string;
}

export interface SubscriptionResponse {
  subscription: Record<string, unknown>;
}