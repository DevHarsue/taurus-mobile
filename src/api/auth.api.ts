import { publicAuthClient, authClient } from '@api/index';
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  AuthUser
} from '@app-types/auth';

export async function register(body: RegisterRequest): Promise<RegisterResponse> {
  const resp = await publicAuthClient.post<RegisterResponse>('/api/auth/register', body);
  return resp.data;
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const resp = await publicAuthClient.post<LoginResponse>('/api/auth/login', body);
  return resp.data;
}

export async function refresh(body: RefreshRequest): Promise<RefreshResponse> {
  const resp = await publicAuthClient.post<RefreshResponse>('/api/auth/refresh', body);
  return resp.data;
}

export async function me(): Promise<AuthUser> {
  const resp = await authClient.get<AuthUser>('/api/auth/me');
  return resp.data;
}