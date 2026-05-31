import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@hooks/useTheme';
import { typography, radii, type Colors } from '@theme/index';

/**
 * Modal de confirmacion reutilizable y cross-platform (Fase 6).
 *
 * Sigue el patron de `ToastContext` (Fase 4): un unico modal montado a nivel de
 * provider, controlado via `confirm(...)` que devuelve `Promise<boolean>`.
 * Soporta un cuerpo "rico" mediante `rows` (pares label/valor), util para el
 * resumen de renovacion, ademas de un `message` simple.
 */

export type ConfirmRow = { label: string; value: string };

export type ConfirmOptions = {
  title: string;
  message?: string;
  rows?: ConfirmRow[];
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

interface IConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<IConfirmContextValue | undefined>(undefined);

export function ConfirmModalProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    setVisible(false);
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setVisible(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const value = useMemo<IConfirmContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => settle(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>{options?.title}</Text>

            {!!options?.message && <Text style={styles.message}>{options.message}</Text>}

            {!!options?.rows?.length && (
              <View style={styles.rows}>
                {options.rows.map((row) => (
                  <View key={row.label} style={styles.row}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <Text style={styles.rowValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actions}>
              <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => settle(false)}>
                <Text style={styles.cancelText}>{options?.cancelLabel ?? 'Cancelar'}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.btn,
                  styles.confirmBtn,
                  options?.destructive && styles.confirmDanger,
                ]}
                onPress={() => settle(true)}
              >
                <Text style={styles.confirmText}>{options?.confirmLabel ?? 'Confirmar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirmContext(): IConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmModalProvider>');
  return ctx;
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: '#000000AA',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      gap: 12,
    },
    title: {
      fontFamily: typography.headingS.fontFamily,
      fontSize: typography.headingS.fontSize,
      color: colors.textPrimary,
    },
    message: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    rows: {
      gap: 10,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    rowLabel: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textMuted,
      flexShrink: 1,
    },
    rowValue: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.textPrimary,
      textAlign: 'right',
      flexShrink: 1,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    btn: {
      flex: 1,
      height: 48,
      borderRadius: radii.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelBtn: {
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: 'transparent',
    },
    cancelText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    confirmBtn: {
      backgroundColor: colors.primaryRed,
    },
    confirmDanger: {
      backgroundColor: colors.badgeExpired,
    },
    confirmText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.white,
      fontWeight: '700',
    },
  });
