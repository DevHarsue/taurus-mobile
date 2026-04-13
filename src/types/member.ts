import type { IPaginatedResponse } from './api';

// ─── Enums y tipos base ────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'expired' | 'pending';

// ─── Request / Response ────────────────────────────────────────────────────

export interface CreateMemberRequest {
  name: string;
  cedula: string;
  phone: string;
  email: string;
  fingerprint_id: string;
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
  subscription: Record<string, unknown>;
}

// ─── Entidades ─────────────────────────────────────────────────────────────

export interface MemberListItem {
  id: string;
  name: string;
  cedula: string;
  status: MemberStatus;
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
  planName?: string;
  planStartDate?: string;
  planEndDate?: string;
}

// ─── Perfil del miembro (pantalla MyProfile) ───────────────────────────────

export interface IAttendanceDay {
  date: string;
  attended: boolean;
}

export interface IMemberProfile {
  id: string;
  name: string;
  cedula: string;
  phone: string;
  email: string;
  status: MemberStatus;
  planName: string;
  planExpiry: string;
  daysLeft: number;
  streak: number;
  totalVisits: number;
  nextMonthVisits: number;
  attendance: IAttendanceDay[];
}

// ─── Historial de renovaciones ─────────────────────────────────────────────

export type RenewalType = 'renewal' | 'initial' | 'upgrade';

export interface IRenewalHistoryItem {
  id: string;
  type: RenewalType;
  planName: string;
  processedBy: string;
  date: string;
  duration: string;
}
