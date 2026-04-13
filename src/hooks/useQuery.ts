import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface IQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface IUseQueryOptions<T> {
  /** Funcion asincrona que retorna los datos. */
  queryFn: () => Promise<T>;
  /** Dependencias que disparan un re-fetch. */
  deps?: unknown[];
  /** Mensaje de error legible para el usuario. */
  errorMessage?: string;
  /** Si es false, no ejecuta el fetch (util para hooks skeleton). */
  enabled?: boolean;
}

// ─── useQuery ──────────────────────────────────────────────────────────────

export function useQuery<T>(options: IUseQueryOptions<T>): IQueryResult<T> {
  const {
    queryFn,
    deps = [],
    errorMessage = 'Error al cargar datos',
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const fetch = useCallback(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await queryFnRef.current();
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setError(errorMessage);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    return fetch();
  }, [fetch, enabled]);

  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch };
}

// ─── usePaginatedQuery ─────────────────────────────────────────────────────

export interface IPaginatedResult<T> extends IQueryResult<T> {
  page: number;
  setPage: (page: number) => void;
}

export interface IUsePaginatedQueryOptions<T>
  extends Omit<IUseQueryOptions<T>, 'queryFn'> {
  queryFn: (page: number, limit: number) => Promise<T>;
  limit?: number;
}

export function usePaginatedQuery<T>(
  options: IUsePaginatedQueryOptions<T>,
): IPaginatedResult<T> {
  const { queryFn, limit = 20, deps = [], ...rest } = options;
  const [page, setPage] = useState(1);

  const result = useQuery<T>({
    ...rest,
    queryFn: () => queryFn(page, limit),
    deps: [...deps, page, limit],
  });

  return { ...result, page, setPage };
}
