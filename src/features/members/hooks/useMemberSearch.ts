import { useCallback, useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { MemberListItem } from '@app-types/member';

const DEBOUNCE_MS = 300;

export function useMemberSearch() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [search]);

  const query = useInfiniteQuery<MemberListItem>({
    queryFn: (page, limit) =>
      membersService.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: filter || undefined,
      }),
    deps: [debouncedSearch, filter],
    errorMessage: 'No se pudo cargar miembros',
    // Solo se cachea la lista base (sin busqueda ni filtros activos).
    cacheKey: !debouncedSearch && !filter ? 'members:list' : undefined,
  });

  const onSearch = useCallback((text: string) => setSearch(text), []);
  const onFilter = useCallback((key: string) => setFilter(key), []);

  return { ...query, search, filter, onSearch, onFilter };
}
