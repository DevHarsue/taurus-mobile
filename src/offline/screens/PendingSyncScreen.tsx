import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloudOff, RefreshCw, Trash2 } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { EmptyState } from '@components/EmptyState';
import { useTheme } from '@hooks/useTheme';
import { useToast } from '@hooks/useToast';
import { confirmDialog } from '@utils/confirmDialog';
import { typography, spacing, type Colors } from '@theme/index';
import { useConnectivity } from '../ConnectivityContext';
import { useOutbox } from '../OutboxContext';
import type { OpStatus, OutboxOp } from '../types';

const STATUS_INFO: Record<
  OpStatus,
  { label: string; variant: 'active' | 'expired' | 'neutral' | 'warning' }
> = {
  pending: { label: 'PENDIENTE', variant: 'warning' },
  'in-flight': { label: 'SINCRONIZANDO', variant: 'active' },
  failed: { label: 'FALLIDA', variant: 'expired' },
};

function formatOpDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Operaciones guardadas sin conexion: ver su estado, reintentar las
 * fallidas o descartarlas.
 */
export default function PendingSyncScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { ops, retry, discard, flush } = useOutbox();
  const { isOnline } = useConnectivity();
  const { toast } = useToast();

  const handleRetry = async (op: OutboxOp) => {
    if (!isOnline) {
      toast.info('Sin conexión: se reintentará al recuperar internet');
    }
    await retry(op.id);
  };

  const handleDiscard = async (op: OutboxOp) => {
    const ok = await confirmDialog(
      'Descartar operación',
      `¿Descartar "${op.label}"? Esta operación no se enviará al servidor.`,
      { destructive: true, confirmLabel: 'Descartar' },
    );
    if (!ok) return;
    await discard(op.id);
    toast.success('Operación descartada');
  };

  const handleSyncNow = () => {
    if (!isOnline) {
      toast.info('Sin conexión: se sincronizará al recuperar internet');
      return;
    }
    void flush();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Pendientes de sincronizar"
        onBack={() => nav.goBack()}
        rightIcon={
          ops.length > 0 ? (
            <RefreshCw size={20} color={colors.textPrimary} strokeWidth={2} />
          ) : undefined
        }
        onRightPress={handleSyncNow}
      />

      <FlatList<OutboxOp>
        data={ops}
        keyExtractor={(op) => op.id}
        contentContainerStyle={[
          styles.list,
          ops.length === 0 && styles.listEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: op }) => {
          const status = STATUS_INFO[op.status];
          return (
            <Card style={styles.opCard}>
              <View style={styles.opHeader}>
                <Text style={styles.opLabel} numberOfLines={1}>
                  {op.label}
                </Text>
                <Badge
                  label={status.label}
                  variant={status.variant}
                  badgeStyle="pill"
                />
              </View>
              <Text style={styles.opMeta}>
                Guardada el {formatOpDate(op.createdAt)}
                {op.retries > 0 ? ` · ${op.retries} reintento(s)` : ''}
              </Text>
              {op.lastError ? (
                <Text style={styles.opError} numberOfLines={2}>
                  {op.lastError}
                </Text>
              ) : null}
              <View style={styles.opActions}>
                {op.status === 'failed' && (
                  <Button
                    variant="outline"
                    title="Reintentar"
                    icon={
                      <RefreshCw
                        size={16}
                        color={colors.primaryRed}
                        strokeWidth={2}
                      />
                    }
                    onPress={() => void handleRetry(op)}
                    style={styles.opActionBtn}
                  />
                )}
                <Button
                  variant="outline"
                  title="Descartar"
                  icon={
                    <Trash2
                      size={16}
                      color={colors.primaryRed}
                      strokeWidth={2}
                    />
                  }
                  onPress={() => void handleDiscard(op)}
                  style={styles.opActionBtn}
                />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon={CloudOff}
            title="Nada pendiente"
            description="Todas las operaciones están sincronizadas con el servidor"
          />
        }
      />
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.xl, gap: spacing.md },
    listEmpty: { flexGrow: 1, justifyContent: 'center' },
    opCard: { padding: spacing.lg, gap: 6 },
    opHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    opLabel: {
      flex: 1,
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textPrimary,
    },
    opMeta: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 11,
      color: colors.textMuted,
    },
    opError: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.badgeExpired,
    },
    opActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    opActionBtn: { flex: 1 },
  });
