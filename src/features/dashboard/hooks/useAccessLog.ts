import { useState, useMemo } from 'react';
import { useQuery } from '@hooks/useQuery';
import { accessService } from '@api/services';
import type { IAccessLogItem } from '@app-types/access';

export type AccessLogFilter = 'all' | 'granted' | 'denied';

export function useAccessLog() {
  const [filter, setFilter] = useState<AccessLogFilter>('all');

  const query = useQuery<IAccessLogItem[]>({
    queryFn: () => accessService.getLog({ limit: 100 }),
    errorMessage: 'No se pudo cargar el registro de accesos',
  });

  const filteredData = useMemo(() => {
    if (!query.data) return null;
    if (filter === 'all') return query.data;
    const granted = filter === 'granted';
    return query.data.filter((item) => item.granted === granted);
  }, [query.data, filter]);

  return {
    ...query,
    data: filteredData,
    filter,
    setFilter,
  };
}
