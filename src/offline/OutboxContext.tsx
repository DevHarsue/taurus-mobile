import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { outbox } from './OutboxQueue';
import type { OutboxOp } from './types';

interface OutboxValue {
  ops: OutboxOp[];
  pendingCount: number;
  retry: (id: string) => Promise<void>;
  discard: (id: string) => Promise<void>;
  flush: () => Promise<void>;
}

const OutboxContext = createContext<OutboxValue | undefined>(undefined);

export function OutboxProvider({ children }: { children: React.ReactNode }) {
  const [ops, setOps] = useState<OutboxOp[]>(() => outbox.list());

  useEffect(() => {
    const unsubscribe = outbox.subscribe(() => setOps(outbox.list()));
    void outbox.init();
    return unsubscribe;
  }, []);

  const value = useMemo<OutboxValue>(
    () => ({
      ops,
      pendingCount: ops.length,
      retry: (id) => outbox.retry(id),
      discard: (id) => outbox.discard(id),
      flush: () => outbox.flush(),
    }),
    [ops],
  );

  return (
    <OutboxContext.Provider value={value}>{children}</OutboxContext.Provider>
  );
}

export function useOutbox(): OutboxValue {
  const ctx = useContext(OutboxContext);
  if (!ctx) {
    throw new Error('useOutbox debe usarse dentro de <OutboxProvider>');
  }
  return ctx;
}
