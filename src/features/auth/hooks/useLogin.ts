import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import type { LoginRequest } from '@app-types/auth';

export function useLogin() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (body: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      await login(body);
    } catch (e) {
      setError('No se pudo iniciar sesión');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}