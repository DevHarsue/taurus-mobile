import type { IPaginatedResponse } from '@api/interfaces';
import { normalizePhone } from '@utils/validators';
import { BaseApiService } from './BaseApiService';
import type {
  MemberListItem,
  MemberDetail,
  MemberCreated,
  CreateMemberRequest,
  GetMembersQuery,
  UpdateMemberRequest,
  CompleteProfileRequest,
  RenewMemberRequest,
  SubscriptionResponse,
} from '@app-types/member';

/** Elimina el '+' inicial opcional del telefono antes de enviarlo al backend. */
function withNormalizedPhone<T extends { phone?: string }>(body: T): T {
  return body.phone ? { ...body, phone: normalizePhone(body.phone) } : body;
}

export class MembersService extends BaseApiService {
  async getAll(
    query?: GetMembersQuery,
  ): Promise<IPaginatedResponse<MemberListItem>> {
    return this.get('/api/members', query as Record<string, unknown>);
  }

  async getById(id: string): Promise<MemberDetail> {
    return this.get(`/api/members/${id}`);
  }

  async getMine(): Promise<MemberDetail> {
    return this.get('/api/members/me');
  }

  async getMySubscriptions(): Promise<import('@app-types/subscription').Subscription[]> {
    return this.get('/api/members/me/subscriptions');
  }

  async completeMyProfile(body: CompleteProfileRequest): Promise<MemberDetail> {
    return this.post('/api/members/me/complete-profile', withNormalizedPhone(body));
  }

  async create(body: CreateMemberRequest): Promise<MemberCreated> {
    return this.post('/api/members', withNormalizedPhone(body));
  }

  async update(id: string, body: UpdateMemberRequest): Promise<MemberDetail> {
    return this.put(`/api/members/${id}`, withNormalizedPhone(body));
  }

  async remove(id: string): Promise<void> {
    return this.delete(`/api/members/${id}`);
  }

  async renew(
    id: string,
    body: RenewMemberRequest,
  ): Promise<SubscriptionResponse> {
    return this.post(`/api/members/${id}/renew`, body);
  }

  async startEnrollment(
    id: string,
    deviceId: string,
  ): Promise<EnrollmentSession> {
    return this.post(`/api/members/${id}/enroll/start`, { deviceId });
  }

  async getEnrollmentStatus(id: string): Promise<EnrollmentSession | EnrollmentIdle> {
    return this.get(`/api/members/${id}/enroll/status`);
  }

  async cancelEnrollment(id: string): Promise<void> {
    return this.delete(`/api/members/${id}/enroll/cancel`);
  }

  async deleteFingerprint(id: string, deviceId: string): Promise<void> {
    return this.delete(`/api/members/${id}/fingerprint`, { deviceId });
  }
}

export type EnrollmentStep =
  | 'starting'
  | 'place_finger'
  | 'remove_finger'
  | 'place_again'
  | 'building'
  | 'done'
  | 'delete';

export type EnrollmentStatus =
  | 'in_progress'
  | 'success'
  | 'failed'
  | 'timeout';

export interface EnrollmentSession {
  memberId: string;
  fingerprintId: number;
  deviceId: string;
  step: EnrollmentStep;
  status: EnrollmentStatus;
  message: string;
  updatedAt?: string;
}

export interface EnrollmentIdle {
  status: 'idle';
  step: 'idle';
}
