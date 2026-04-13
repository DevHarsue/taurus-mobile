import { useEffect, useState } from 'react';
import * as accessApi from '@api/access.api';
import type { AccessLogItem } from '@app-types/access';

export function useDashboard() {
  const [data, setData] = useState<AccessLogItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const log = await accessApi.getAccessLog({ limit: 50, offset: 0 });
        if (!cancelled) setData(log);
      } catch {
        if (!cancelled) setError('No se pudo cargar el dashboard');
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