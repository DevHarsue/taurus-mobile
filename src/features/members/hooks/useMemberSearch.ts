import { useCallback, useEffect, useRef, useState } from 'react';
import { usePaginatedQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { GetMembersResponse } from '@app-types/member';

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

  const query = usePaginatedQuery<GetMembersResponse>({
    queryFn: (page, limit) =>
      membersService.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: filter || undefined,
      }),
    deps: [debouncedSearch, filter],
    errorMessage: 'No se pudo cargar miembros',
  });

  const onSearch = useCallback((text: string) => setSearch(text), []);
  const onFilter = useCallback((key: string) => setFilter(key), []);

  return { ...query, search, filter, onSearch, onFilter };
}
