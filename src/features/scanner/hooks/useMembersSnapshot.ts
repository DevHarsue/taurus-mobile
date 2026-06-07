import { useEffect } from 'react';
import { membersService } from '@api/services';
import type { MemberStatus } from '@app-types/member';
import { ReadCache, useConnectivity } from '@offline';
import { drainPaginated } from '@utils/pdf';

const SNAPSHOT_KEY = 'members:snapshot';
const SNAPSHOT_MAX = 1000;

/** Datos minimos por miembro para validar entrada sin conexion. */
export interface SnapshotMember {
  id: string;
  name: string;
  cedula: string;
  subscriptionStatus: MemberStatus;
  daysLeft: number;
}

/**
 * Mantiene un snapshot local de los miembros (estado + dias restantes)
 * para que el scanner pueda validar entradas SIN internet. Se refresca
 * cada vez que la pantalla del scanner se monta estando online.
 */
export function useMembersSnapshot(): void {
  const { isOnline } = useConnectivity();

  useEffect(() => {
    if (!isOnline) return;
    let cancelled = false;
    (async () => {
      try {
        const { rows } = await drainPaginated(
          (page, limit) => membersService.getAll({ page, limit }),
          { max: SNAPSHOT_MAX },
        );
        if (cancelled) return;
        const snapshot: SnapshotMember[] = rows.map((m) => ({
          id: m.id,
          name: m.name,
          cedula: m.cedula,
          subscriptionStatus: m.subscriptionStatus,
          daysLeft: m.daysLeft,
        }));
        ReadCache.set(SNAPSHOT_KEY, snapshot);
      } catch {
        // Sin red o error transitorio: se conserva el snapshot anterior.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOnline]);
}

/** Busca un miembro en el snapshot local (hidrata desde disco si hace falta). */
export async function lookupSnapshotMember(
  memberId: string,
): Promise<SnapshotMember | null> {
  await ReadCache.hydrate(SNAPSHOT_KEY);
  const entry = ReadCache.get<SnapshotMember[]>(SNAPSHOT_KEY);
  if (!entry) return null;
  return entry.data.find((m) => m.id === memberId) ?? null;
}
