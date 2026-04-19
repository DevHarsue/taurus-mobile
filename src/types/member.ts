import type { IPaginatedResponse } from './api';
import type { Subscription } from './subscription';

// ─── Enums y tipos base ────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'expired';

// ─── Request / Response ────────────────────────────────────────────────────

export interface CreateMemberRequest {
  userId: string;
  name: string;
  cedula: string;
  phone?: string;
  email?: string;
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
}

export interface MemberStatusResponse {
  name: string;
  active: boolean;
  daysLeft: number;
  fingerprintId?: number;
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
  phone?: string;
  email?: string;
  status: MemberStatus;
  daysLeft: number;
  fingerprintId?: number;
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
