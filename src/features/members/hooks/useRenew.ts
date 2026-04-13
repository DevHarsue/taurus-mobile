import { useState } from 'react';
import * as membersApi from '@api/members.api';

export function useRenew() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renew = async (memberId: string, planId: string) => {
    setLoading(true);
    setError(null);
    try {
      await membersApi.renewMember(memberId, { planId });
    } catch {
      setError('No se pudo renovar');
      throw new Error('renew_failed');
    } finally {
      setLoading(false);
    }
  };

  return { renew, loading, error };
}