/** Prefijo de IDs locales de entidades creadas offline (aun sin id real). */
export const TEMP_ID_PREFIX = 'temp:';

export function isTempId(id: string): boolean {
  return id.startsWith(TEMP_ID_PREFIX);
}

export function newTempId(): string {
  return `${TEMP_ID_PREFIX}${newUuid()}`;
}

/**
 * UUID v4. Usa crypto.randomUUID si existe (web moderno / Hermes reciente)
 * con fallback en Math.random — suficiente para claves de idempotencia.
 */
export function newUuid(): string {
  const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } })
    .crypto;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
