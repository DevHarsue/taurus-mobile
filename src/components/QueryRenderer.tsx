import React from 'react';
import type { IQueryResult } from '@hooks/useQuery';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

export interface IQueryRendererProps<T> {
  query: IQueryResult<T>;
  children: (data: T) => React.ReactElement;
  emptyTitle?: string;
  isEmpty?: (data: T) => boolean;
  /** Skeleton custom a mostrar mientras carga (en vez del spinner generico). */
  skeleton?: React.ReactNode;
  /** Empty state custom (en vez del EmptyState por defecto). */
  empty?: React.ReactNode;
}

export function QueryRenderer<T>({
  query,
  children,
  emptyTitle = 'Sin datos',
  isEmpty,
  skeleton,
  empty,
}: IQueryRendererProps<T>) {
  const { data, loading, error } = query;

  if (loading) return skeleton ? <>{skeleton}</> : <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={query.refetch} />;
  if (data == null) return empty ? <>{empty}</> : <EmptyState title={emptyTitle} />;
  if (isEmpty?.(data)) {
    return empty ? <>{empty}</> : <EmptyState title={emptyTitle} />;
  }

  return children(data);
}
