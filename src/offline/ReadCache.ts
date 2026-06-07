import { kvStore } from './kvStore';
import type { ReadCacheEntry } from './types';

const STORAGE_PREFIX = 'taurus.cache.';

/**
 * Cache de lecturas para stale-while-revalidate: las pantallas muestran
 * la ultima respuesta conocida al instante (incluso offline) mientras
 * la query revalida en background.
 *
 * Claves por convencion: 'members:list', 'member:<id>', 'plans:list',
 * 'subscriptions:<memberId>', 'members:snapshot'.
 */
class ReadCacheImpl {
  private memory = new Map<string, ReadCacheEntry>();

  /** Lectura sincrona desde memoria (para el primer render). */
  get<T>(key: string): ReadCacheEntry<T> | null {
    return (this.memory.get(key) as ReadCacheEntry<T> | undefined) ?? null;
  }

  /** Hidrata una clave desde disco a memoria (llamar antes de usar get). */
  async hydrate(key: string): Promise<ReadCacheEntry | null> {
    if (this.memory.has(key)) return this.memory.get(key) ?? null;
    const entry = await kvStore.getJson<ReadCacheEntry>(
      STORAGE_PREFIX + key,
    );
    if (entry) this.memory.set(key, entry);
    return entry;
  }

  set<T>(key: string, data: T): void {
    const entry: ReadCacheEntry<T> = { data, updatedAt: Date.now() };
    this.memory.set(key, entry);
    void kvStore.setJson(STORAGE_PREFIX + key, entry);
  }

  invalidate(key: string): void {
    this.memory.delete(key);
    void kvStore.remove(STORAGE_PREFIX + key);
  }
}

export const ReadCache = new ReadCacheImpl();
