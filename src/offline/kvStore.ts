import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Almacen clave→valor JSON para el modulo offline (cache de lecturas,
 * cola de escrituras, sesion cacheada). Usa AsyncStorage (SQLite en
 * Android, archivo en iOS, localStorage en web).
 *
 * NO usar para datos sensibles (tokens van en expo-secure-store via
 * @utils/storage). No usar AsyncStorage directo fuera de este modulo.
 */
export const kvStore = {
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setJson(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage lleno o no disponible: la app sigue funcionando online.
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignorado
    }
  },
};
