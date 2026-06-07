import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { outbox } from './OutboxQueue';

interface ConnectivityValue {
  /** true si hay conexion a internet (o aun no se ha determinado). */
  isOnline: boolean;
}

const ConnectivityContext = createContext<ConnectivityValue>({
  isOnline: true,
});

/** Referencia global para consultar conectividad fuera de React (hooks puros). */
let currentIsOnline = true;
export function getIsOnline(): boolean {
  return currentIsOnline;
}

export function ConnectivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const wasOnlineRef = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isInternetReachable puede ser null mientras NetInfo verifica:
      // se considera online salvo evidencia de lo contrario.
      const online =
        state.isConnected !== false &&
        state.isInternetReachable !== false;

      currentIsOnline = online;
      setIsOnline(online);

      if (online && !wasOnlineRef.current) {
        // Reconexion: sincronizar el buffer de escrituras pendientes.
        void outbox.flush();
      }
      wasOnlineRef.current = online;
    });

    // Drenar pendientes de sesiones anteriores al arrancar.
    void outbox.init().then(() => {
      if (currentIsOnline) void outbox.flush();
    });

    return unsubscribe;
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOnline }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity(): ConnectivityValue {
  return useContext(ConnectivityContext);
}
