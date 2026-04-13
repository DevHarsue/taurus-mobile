export function decodeJwtPayload<TPayload extends object>(token: string): TPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    // base64url -> base64
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

    const json = globalThis.atob(padded);
    return JSON.parse(json) as TPayload;
  } catch {
    return null;
  }
}