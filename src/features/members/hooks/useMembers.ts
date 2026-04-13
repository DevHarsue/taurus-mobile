import { useEffect, useState } from 'react';
import * as membersApi from '@api/members.api';
import type { GetMembersResponse } from '@app-types/member';

export function useMembers() {
  const [data, setData] = useState<GetMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const resp = await membersApi.getMembers({ page: 1, limit: 20 });
        if (!cancelled) setData(resp);
      } catch {
        if (!cancelled) setError('No se pudo cargar miembros');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}