// ─── API Service Interfaces (SOLID: Interface Segregation) ─────────────────

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

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

/** CRUD completo: lectura + escritura. */
export interface ICrudService<
  TItem,
  TDetail,
  TCreate,
  TQuery = Record<string, unknown>,
> extends IReadService<TItem, TDetail, TQuery>,
    IWriteService<TCreate, TDetail> {}
