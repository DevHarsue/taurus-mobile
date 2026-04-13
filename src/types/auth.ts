export type UserRole = 'admin' | 'member';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
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

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}