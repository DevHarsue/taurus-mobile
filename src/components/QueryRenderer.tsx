import React from 'react';
import type { IQueryResult } from '@hooks/useQuery';
import { LoadingSpinner } from './LoadingSpinner';
import { AlertBanner } from './AlertBanner';
import { EmptyState } from './EmptyState';

export interface IQueryRendererProps<T> {
  query: IQueryResult<T>;
  children: (data: T) => React.ReactElement;
  emptyTitle?: string;
  isEmpty?: (data: T) => boolean;
}

export function QueryRenderer<T>({
  query,
  children,
  emptyTitle = 'Sin datos',
  isEmpty,
}: IQueryRendererProps<T>) {
  const { data, loading, error } = query;

  if (loading) return <LoadingSpinner />;
  if (error) return <AlertBanner message={error} variant="error" />;
  if (data == null) return <EmptyState title={emptyTitle} />;
  if (isEmpty?.(data)) return <EmptyState title={emptyTitle} />;

  return children(data);
}
