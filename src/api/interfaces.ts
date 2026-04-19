// ─── API Service Interfaces (SOLID: Interface Segregation) ─────────────────

import type { IPaginatedResponse } from '@app-types/api';
export type { IPaginatedResponse } from '@app-types/api';

/** Operaciones de lectura para un recurso. */
export interface IReadService<
  TItem,
  TDetail = TItem,
  TQuery = Record<string, unknown>,
> {
  getAll(query?: TQuery): Promise<TItem[] | IPaginatedResponse<TItem>>;
  getById(id: string): Promise<TDetail>;
}

/** Operaciones de escritura para un recurso. */
export interface IWriteService<TCreate, TResponse = void> {
  create(body: TCreate): Promise<TResponse>;
}

/** Operaciones de actualizacion para un recurso. */
export interface IUpdateService<TUpdate, TResponse = void> {
  update(id: string, body: TUpdate): Promise<TResponse>;
}

/** Operaciones de eliminacion para un recurso. */
export interface IDeleteService {
  remove(id: string): Promise<void>;
}

/** CRUD completo: lectura + escritura + eliminacion. */
export interface ICrudService<
  TItem,
  TDetail,
  TCreate,
  TQuery = Record<string, unknown>,
> extends IReadService<TItem, TDetail, TQuery>,
    IWriteService<TCreate, TDetail>,
    IDeleteService {}
