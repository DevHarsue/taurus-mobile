import { useCallback, useEffect, useRef, useState } from 'react';
import type { IPaginatedResponse } from '@app-types/api';
import { ReadCache } from '@offline/ReadCache';

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface IQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** True si `data` proviene del cache offline (aun sin revalidar). */
  fromCache: boolean;
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
  /**
   * Clave de cache offline (stale-while-revalidate): si existe una entrada
   * cacheada se muestra al instante y la query revalida en background. Si
   * la red falla y hay cache, se mantienen los datos en vez de error.
   */
  cacheKey?: string;
}

// ─── useQuery ──────────────────────────────────────────────────────────────

export function useQuery<T>(options: IUseQueryOptions<T>): IQueryResult<T> {
  const {
    queryFn,
    deps = [],
    errorMessage = 'Error al cargar datos',
    enabled = true,
    cacheKey,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  const hasDataRef = useRef(false);

  const fetch = useCallback(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    (async () => {
      // Stale-while-revalidate: servir el cache de inmediato si existe.
      if (cacheKey && !hasDataRef.current) {
        const entry = await ReadCache.hydrate(cacheKey);
        if (!cancelled && entry && !hasDataRef.current) {
          setData(entry.data as T);
          setFromCache(true);
          hasDataRef.current = true;
        }
      }

      try {
        const result = await queryFnRef.current();
        if (!cancelled) {
          setData(result);
          setFromCache(false);
          hasDataRef.current = true;
          if (cacheKey) ReadCache.set(cacheKey, result);
        }
      } catch {
        // Con datos cacheados servidos, una falla de red no es un error de
        // pantalla: se mantienen los datos y el banner global indica offline.
        if (!cancelled && !hasDataRef.current) setError(errorMessage);
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

  return { data, loading, error, refetch, fromCache };
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

// ─── useInfiniteQuery ──────────────────────────────────────────────────────
// Acumula paginas en un solo array (modo "append") para infinite scroll.
// A diferencia de usePaginatedQuery (que reemplaza la pagina), este hook
// mantiene el listado acumulado y expone loadMore()/hasMore.

export interface IInfiniteResult<TItem> {
  /** Items acumulados de todas las paginas cargadas. */
  items: TItem[];
  /** Total de items disponibles segun el backend. */
  total: number;
  /** Carga inicial (pagina 1). */
  loading: boolean;
  /** Cargando una pagina adicional (append). */
  loadingMore: boolean;
  error: string | null;
  /** Resetea a la pagina 1 (pull-to-refresh / focus). */
  refetch: () => void;
  /** Carga la siguiente pagina y la agrega al acumulado. */
  loadMore: () => void;
  /** True mientras queden items por cargar. */
  hasMore: boolean;
  /** True si los items provienen del cache offline (aun sin revalidar). */
  fromCache: boolean;
}

export interface IUseInfiniteQueryOptions<TItem> {
  queryFn: (page: number, limit: number) => Promise<IPaginatedResponse<TItem>>;
  limit?: number;
  deps?: unknown[];
  errorMessage?: string;
  enabled?: boolean;
  /** Cache offline de la primera pagina (stale-while-revalidate). */
  cacheKey?: string;
}

export function useInfiniteQuery<TItem>(
  options: IUseInfiniteQueryOptions<TItem>,
): IInfiniteResult<TItem> {
  const {
    queryFn,
    limit = 20,
    deps = [],
    errorMessage = 'Error al cargar datos',
    enabled = true,
    cacheKey,
  } = options;

  const [items, setItems] = useState<TItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  const hasDataRef = useRef(false);

  // Token para descartar respuestas de peticiones obsoletas (cambio de deps / refetch).
  const requestRef = useRef(0);

  const fetchPage = useCallback(
    (targetPage: number, mode: 'replace' | 'append') => {
      const myRequest = ++requestRef.current;
      if (mode === 'replace') setLoading(true);
      else setLoadingMore(true);
      setError(null);

      (async () => {
        // SWR: servir la primera pagina cacheada de inmediato.
        if (cacheKey && mode === 'replace' && !hasDataRef.current) {
          const entry =
            await ReadCache.hydrate(cacheKey);
          if (
            myRequest === requestRef.current &&
            entry &&
            !hasDataRef.current
          ) {
            const cached = entry.data as IPaginatedResponse<TItem>;
            setItems(cached.data);
            setTotal(cached.total);
            setFromCache(true);
            hasDataRef.current = true;
          }
        }

        try {
          const result = await queryFnRef.current(targetPage, limit);
          if (myRequest !== requestRef.current) return;
          setTotal(result.total);
          setPage(targetPage);
          setItems((prev) =>
            mode === 'append' ? [...prev, ...result.data] : result.data,
          );
          setFromCache(false);
          hasDataRef.current = true;
          if (cacheKey && mode === 'replace' && targetPage === 1) {
            ReadCache.set(cacheKey, result);
          }
        } catch {
          // Con cache servido, la falla de red no borra la lista.
          if (myRequest === requestRef.current && !hasDataRef.current) {
            setError(errorMessage);
          }
        } finally {
          if (myRequest === requestRef.current) {
            setLoading(false);
            setLoadingMore(false);
          }
        }
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, errorMessage, cacheKey],
  );

  // Carga inicial / reset cuando cambian las dependencias (busqueda, filtros...).
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    fetchPage(1, 'replace');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, fetchPage, ...deps]);

  const hasMore = items.length < total;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchPage(page + 1, 'append');
  }, [loading, loadingMore, hasMore, page, fetchPage]);

  const refetch = useCallback(() => {
    fetchPage(1, 'replace');
  }, [fetchPage]);

  return {
    items,
    total,
    loading,
    loadingMore,
    error,
    refetch,
    loadMore,
    hasMore,
    fromCache,
  };
}
