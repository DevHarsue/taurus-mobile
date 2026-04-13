import type { AxiosInstance } from 'axios';

/**
 * Clase base abstracta para servicios API.
 * Encapsula el patron repetido de llamadas Axios (DRY).
 */
export abstract class BaseApiService {
  constructor(protected readonly client: AxiosInstance) {}

  protected async get<T>(
    path: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const resp = await this.client.get<T>(path, { params });
    return resp.data;
  }

  protected async post<T>(path: string, body?: unknown): Promise<T> {
    const resp = await this.client.post<T>(path, body);
    return resp.data;
  }

  protected async put<T>(path: string, body?: unknown): Promise<T> {
    const resp = await this.client.put<T>(path, body);
    return resp.data;
  }

  protected async delete<T>(path: string): Promise<T> {
    const resp = await this.client.delete<T>(path);
    return resp.data;
  }
}
