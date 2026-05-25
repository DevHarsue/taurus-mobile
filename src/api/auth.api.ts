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
  GoogleLoginRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '@app-types/auth';

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const resp = await publicAuthClient.post<LoginResponse>('/api/auth/login', body);
  return resp.data;
}

export async function loginWithGoogle(body: GoogleLoginRequest): Promise<LoginResponse> {
  const resp = await publicAuthClient.post<LoginResponse>('/api/auth/google', body);
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

export async function publicRegister(body: { email: string; password: string }): Promise<RegisterResponse> {
  const resp = await publicAuthClient.post<RegisterResponse>('/api/auth/register', body);
  return resp.data;
}

export async function forgotPassword(body: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const resp = await publicAuthClient.post<ForgotPasswordResponse>('/api/auth/forgot-password', body);
  return resp.data;
}

export async function resetPassword(body: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const resp = await publicAuthClient.post<ResetPasswordResponse>('/api/auth/reset-password', body);
  return resp.data;
}

export async function changePassword(body: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const resp = await authClient.put<ChangePasswordResponse>('/api/auth/change-password', body);
  return resp.data;
}
