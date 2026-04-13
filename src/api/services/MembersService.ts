import type { ICrudService, IPaginatedResponse } from '@api/interfaces';
import { BaseApiService } from './BaseApiService';
import type {
  MemberListItem,
  MemberDetail,
  CreateMemberRequest,
  GetMembersQuery,
  UpdateMemberRequest,
  RenewMemberRequest,
  SubscriptionResponse,
  IMemberProfile,
  IRenewalHistoryItem,
} from '@app-types/member';

export class MembersService
  extends BaseApiService
  implements
    ICrudService<
      MemberListItem,
      MemberDetail,
      CreateMemberRequest,
      GetMembersQuery
    >
{
  async getAll(
    query?: GetMembersQuery,
  ): Promise<IPaginatedResponse<MemberListItem>> {
    return this.get('/api/members', query as Record<string, unknown>);
  }

  async getById(id: string): Promise<MemberDetail> {
    return this.get(`/api/members/${id}`);
  }

  async create(body: CreateMemberRequest): Promise<MemberDetail> {
    return this.post('/api/members', body);
  }

  async update(id: string, body: UpdateMemberRequest): Promise<MemberDetail> {
    return this.put(`/api/members/${id}`, body);
  }

  async renew(
    id: string,
    body: RenewMemberRequest,
  ): Promise<SubscriptionResponse> {
    return this.post(`/api/members/${id}/renew`, body);
  }

  async getMyProfile(): Promise<IMemberProfile> {
    return this.get('/api/members/me/profile');
  }

  async getRenewalHistory(memberId: string): Promise<IRenewalHistoryItem[]> {
    return this.get(`/api/members/${memberId}/renewals`);
  }
}
