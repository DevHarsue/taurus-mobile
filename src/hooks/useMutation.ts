import { useCallback, useRef, useState } from 'react';

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface IMutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export interface IUseMutationOptions<TInput, TOutput> {
  /** Funcion asincrona que ejecuta la mutacion. */
  mutationFn: (input: TInput) => Promise<TOutput>;
  /** Mensaje de error legible para el usuario. */
  errorMessage?: string;
  /** Callback ejecutado tras una mutacion exitosa. */
  onSuccess?: (data: TOutput) => void;
}

// ─── useMutation ───────────────────────────────────────────────────────────

export function useMutation<TInput, TOutput = void>(
  options: IUseMutationOptions<TInput, TOutput>,
): IMutationResult<TInput, TOutput> {
  const { mutationFn, errorMessage = 'Operacion fallida', onSuccess } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const mutate = useCallback(
    async (input: TInput): Promise<TOutput> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(input);
        if (mountedRef.current) onSuccess?.(result);
        return result;
      } catch (e) {
        if (mountedRef.current) setError(errorMessage);
        throw e;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [mutationFn, errorMessage, onSuccess],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { mutate, loading, error, reset };
}
