export type UserRole = 'admin' | 'member';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  /** false si el usuario entró con Google y aún no ha establecido una clave. */
  hasPassword?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken?: string;
  accessToken?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  /** Requerida solo si el usuario ya tiene contraseña (no para usuarios Google). */
  currentPassword?: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}
