const BASE_MS = 1_000;
const MAX_MS = 30_000;

/** Backoff exponencial acotado: 1s, 2s, 4s... hasta 30s. */
export function computeBackoff(retries: number): number {
  return Math.min(MAX_MS, BASE_MS * 2 ** Math.max(0, retries));
}
