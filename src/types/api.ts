/** Respuesta paginada estandar del backend. */
export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Respuesta de error estandar del backend. */
export interface IApiError {
  statusCode: number;
  message: string;
  error?: string;
}
