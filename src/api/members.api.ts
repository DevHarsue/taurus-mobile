import { membersClient } from '@api/index';
import type {
  CreateMemberRequest,
  CreateMemberResponse,
  GetMembersQuery,
  GetMembersResponse,
  MemberDetail,
  UpdateMemberRequest,
  SubscriptionResponse,
  RenewMemberRequest
} from '@app-types/member';

export async function createMember(body: CreateMemberRequest): Promise<CreateMemberResponse> {
  const resp = await membersClient.post<CreateMemberResponse>('/api/members', body);
  return resp.data;
}

export async function getMembers(query: GetMembersQuery): Promise<GetMembersResponse> {
  const resp = await membersClient.get<GetMembersResponse>('/api/members', { params: query });
  return resp.data;
}

export async function getMemberById(id: string): Promise<MemberDetail> {
  const resp = await membersClient.get<MemberDetail>(`/api/members/${id}`);
  return resp.data;
}

export async function updateMember(id: string, body: UpdateMemberRequest): Promise<Record<string, unknown>> {
  const resp = await membersClient.put<Record<string, unknown>>(`/api/members/${id}`, body);
  return resp.data;
}

export async function renewMember(id: string, body: RenewMemberRequest): Promise<SubscriptionResponse> {
  const resp = await membersClient.post<SubscriptionResponse>(`/api/members/${id}/renew`, body);
  return resp.data;
}