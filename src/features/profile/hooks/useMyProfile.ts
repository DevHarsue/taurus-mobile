import { useEffect, useState } from 'react';

export function useMyProfile() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Backend contract for member profile isn't specified yet; keep as skeleton.
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error };
}