import { publicAuthClient, authClient } from '@api/index';
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutRequest,
  AuthUser,
} from '@app-types/auth';

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const resp = await publicAuthClient.post<LoginResponse>('/api/auth/login', body);
  return resp.data;
}

// Register requiere autenticacion (solo admin)
export async function register(body: RegisterRequest): Promise<RegisterResponse> {
  const resp = await authClient.post<RegisterResponse>('/api/auth/register', body);
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

export async function logout(body: LogoutRequest): Promise<void> {
  await authClient.post('/api/auth/logout', body);
}
