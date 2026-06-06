import type { IPaginatedResponse } from '@app-types/api';

/** Tope de registros por reporte para mantener el PDF manejable. */
export const PDF_MAX_RECORDS = 500;

/** Lanzado cuando no hay registros que exportar con los filtros actuales. */
export class ReportEmptyError extends Error {
  constructor() {
    super('No hay registros para exportar');
    this.name = 'ReportEmptyError';
  }
}

export interface DrainResult<T> {
  rows: T[];
  /** Total reportado por el backend (o filas obtenidas si no hay total real). */
  total: number;
  /** true si el dataset supera el tope y el reporte quedo truncado. */
  truncated: boolean;
}

interface DrainOptions {
  /** Tamano de pagina/chunk por request. Default 100. */
  pageSize?: number;
  /** Maximo de registros a acumular. Default PDF_MAX_RECORDS. */
  max?: number;
}

/**
 * Drena un endpoint paginado estilo IPaginatedResponse (audit, members)
 * iterando `page` hasta agotar el total o alcanzar el tope.
 */
export async function drainPaginated<T>(
  fetchPage: (page: number, limit: number) => Promise<IPaginatedResponse<T>>,
  options?: DrainOptions,
): Promise<DrainResult<T>> {
  const pageSize = options?.pageSize ?? 100;
  const max = options?.max ?? PDF_MAX_RECORDS;

  const rows: T[] = [];
  let total = 0;
  let page = 1;

  for (;;) {
    const res = await fetchPage(page, pageSize);
    rows.push(...res.data);
    total = res.total;
    if (rows.length >= total || res.data.length === 0 || rows.length >= max) {
      break;
    }
    page += 1;
  }

  return {
    rows: rows.slice(0, max),
    total,
    truncated: total > max,
  };
}

/**
 * Drena un endpoint estilo array + offset (access log) pidiendo chunks hasta
 * recibir menos de `pageSize` o alcanzar el tope. No hay `total` real del
 * backend: se reporta lo obtenido y `truncated` cuando se llego justo al tope.
 */
export async function drainOffset<T>(
  fetchChunk: (limit: number, offset: number) => Promise<T[]>,
  options?: DrainOptions,
): Promise<DrainResult<T>> {
  const pageSize = options?.pageSize ?? 100;
  const max = options?.max ?? PDF_MAX_RECORDS;

  const rows: T[] = [];
  let offset = 0;

  for (;;) {
    const chunk = await fetchChunk(pageSize, offset);
    rows.push(...chunk);
    if (chunk.length < pageSize || rows.length >= max) break;
    offset += chunk.length;
  }

  const sliced = rows.slice(0, max);
  return {
    rows: sliced,
    total: sliced.length,
    truncated: rows.length > max || sliced.length === max,
  };
}
