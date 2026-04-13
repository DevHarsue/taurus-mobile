import type { AxiosInstance } from 'axios';
import { BaseApiService } from './BaseApiService';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
  AuthUser,
} from '@app-types/auth';

/**
 * AuthService usa dos clientes:
 * - publicClient: para login/refresh (sin interceptor de auth)
 * - authenticatedClient (heredado de BaseApiService): para register/me/logout
 */
export class AuthService extends BaseApiService {
  constructor(
    private readonly publicClient: AxiosInstance,
    authenticatedClient: AxiosInstance,
  ) {
    super(authenticatedClient);
  }

  async login(body: LoginRequest): Promise<LoginResponse> {
    const resp = await this.publicClient.post<LoginResponse>(
      '/api/auth/login',
      body,
    );
    return resp.data;
  }

  // Register requiere autenticacion (solo admin)
  async register(body: RegisterRequest): Promise<RegisterResponse> {
    return this.post('/api/auth/register', body);
  }

  async refresh(body: RefreshRequest): Promise<RefreshResponse> {
    const resp = await this.publicClient.post<RefreshResponse>(
      '/api/auth/refresh',
      body,
    );
    return resp.data;
  }

  async me(): Promise<AuthUser> {
    return this.get('/api/auth/me');
  }

  async logout(body: LogoutRequest): Promise<void> {
    await this.post('/api/auth/logout', body);
  }
}
