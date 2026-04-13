import { useEffect, useState } from 'react';
import * as plansApi from '@api/plans.api';
import type { Plan } from '@app-types/plan';

export function usePlans() {
  const [data, setData] = useState<Plan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const resp = await plansApi.getPlans();
        if (!cancelled) setData(resp);
      } catch {
        if (!cancelled) setError('No se pudo cargar planes');
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