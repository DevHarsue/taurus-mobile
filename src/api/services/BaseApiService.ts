import type { AxiosInstance, AxiosRequestConfig } from 'axios';

/** Opciones extra para escrituras (soporte offline-first). */
export interface IWriteOptions {
  /**
   * UUID enviado como header `Idempotency-Key`: el backend cachea la
   * respuesta y los re-envios (outbox offline o retry tras timeout)
   * no duplican la operacion.
   */
  idempotencyKey?: string;
}

function buildConfig(options?: IWriteOptions): AxiosRequestConfig | undefined {
  if (!options?.idempotencyKey) return undefined;
  return { headers: { 'Idempotency-Key': options.idempotencyKey } };
}

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

  protected async post<T>(
    path: string,
    body?: unknown,
    options?: IWriteOptions,
  ): Promise<T> {
    const resp = await this.client.post<T>(path, body, buildConfig(options));
    return resp.data;
  }

  protected async put<T>(
    path: string,
    body?: unknown,
    options?: IWriteOptions,
  ): Promise<T> {
    const resp = await this.client.put<T>(path, body, buildConfig(options));
    return resp.data;
  }

  protected async delete<T>(
    path: string,
    body?: unknown,
    options?: IWriteOptions,
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      ...(buildConfig(options) ?? {}),
      ...(body ? { data: body } : {}),
    };
    const resp = await this.client.delete<T>(
      path,
      Object.keys(config).length > 0 ? config : undefined,
    );
    return resp.data;
  }
}
