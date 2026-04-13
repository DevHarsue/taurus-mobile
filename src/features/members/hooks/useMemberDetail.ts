import { useEffect, useState } from 'react';
import * as membersApi from '@api/members.api';
import type { MemberDetail } from '@app-types/member';

export function useMemberDetail(id: string) {
  const [data, setData] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const resp = await membersApi.getMemberById(id);
        if (!cancelled) setData(resp);
      } catch {
        if (!cancelled) setError('No se pudo cargar el miembro');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}