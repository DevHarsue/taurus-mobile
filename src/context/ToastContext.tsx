import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastItem, type ToastVariant } from '@components/Toast';

/**
 * Sistema de toasts global.
 *
 * DECISION: implementacion propia con Context + Animated en vez de
 * `react-native-toast-message`. Razones: cero dependencias nuevas, control
 * total del estilo con los tokens de `src/theme`, y nuestras necesidades son
 * simples (4 variantes, auto-dismiss, cross-platform iOS/Android/Web).
 */

interface IToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface IToastContextValue {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<IToastContextValue | undefined>(undefined);

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<IToastData[]>([]);
  const insets = useSafeAreaInsets();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 3000) => {
      toastCounter += 1;
      const id = `toast-${toastCounter}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    [],
  );

  const value = useMemo<IToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        style={[styles.container, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onDismiss={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToastContext(): IToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'stretch',
  },
});
