import type { IPaginatedResponse } from '@api/interfaces';
import { BaseApiService } from './BaseApiService';
import type {
  MemberListItem,
  MemberDetail,
  MemberCreated,
  CreateMemberRequest,
  GetMembersQuery,
  UpdateMemberRequest,
  RenewMemberRequest,
  SubscriptionResponse,
} from '@app-types/member';

export class MembersService extends BaseApiService {
  async getAll(
    query?: GetMembersQuery,
  ): Promise<IPaginatedResponse<MemberListItem>> {
    return this.get('/api/members', query as Record<string, unknown>);
  }

  async getById(id: string): Promise<MemberDetail> {
    return this.get(`/api/members/${id}`);
  }

  async create(body: CreateMemberRequest): Promise<MemberCreated> {
    return this.post('/api/members', body);
  }

  async update(id: string, body: UpdateMemberRequest): Promise<MemberDetail> {
    return this.put(`/api/members/${id}`, body);
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

}
