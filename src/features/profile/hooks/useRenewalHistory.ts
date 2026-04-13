import { useEffect, useState } from 'react';

export function useRenewalHistory() {
  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Backend contract for renewal history isn't specified yet; keep as skeleton.
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error };
}