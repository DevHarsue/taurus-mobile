import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, History, SearchX } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { FilterChips } from '@components/FilterChips';
import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Skeleton, SkeletonList } from '@components/Skeleton';
import { AuditLogItem } from '../components/AuditLogItem';
import {
  useAuditLog,
  type AuditOperationFilter,
  type AuditTableFilter,
} from '../hooks/useAuditLog';
import { useExportAuditPdf } from '../hooks/useExportAuditPdf';
import { useTheme } from '@hooks/useTheme';
import { useToast } from '@hooks/useToast';
import { haptics } from '@utils/haptics';
import { ReportEmptyError } from '@utils/pdf';
import { spacing, type Colors } from '@theme/index';
import type { DashboardStackParamList } from '@navigation/types';
import type { IAuditLogItem } from '@app-types/audit';

type Nav = NativeStackNavigationProp<DashboardStackParamList>;

const OPERATION_CHIPS = [
  { key: 'all', label: 'Todos' },
  { key: 'INSERT', label: 'Creados' },
  { key: 'UPDATE', label: 'Modificados' },
  { key: 'DELETE', label: 'Eliminados' },
];

const TABLE_CHIPS = [
  { key: 'all', label: 'Todo' },
  { key: 'members', label: 'Miembros' },
  { key: 'membership_plans', label: 'Planes' },
  { key: 'subscriptions', label: 'Suscripciones' },
  { key: 'renewals', label: 'Renovaciones' },
  { key: 'devices', label: 'Dispositivos' },
  { key: 'users', label: 'Usuarios' },
];

function AuditRowSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.skelRow}>
      <Skeleton width={36} height={36} borderRadius={12} />
      <View style={styles.skelInfo}>
        <Skeleton width="55%" height={12} borderRadius={6} />
        <Skeleton width="40%" height={10} borderRadius={5} />
      </View>
      <Skeleton width={70} height={20} borderRadius={10} />
    </View>
  );
}

export default function AuditTrailScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    items,
    loading,
    loadingMore,
    error,
    refetch,
    loadMore,
    hasMore,
    operation,
    setOperation,
    table,
    setTable,
  } = useAuditLog();
  const { mutate: exportPdf, loading: exporting } = useExportAuditPdf();
  const { toast } = useToast();

  const handleRefresh = useCallback(() => {
    haptics.light();
    refetch();
  }, [refetch]);

  const handleExport = useCallback(() => {
    if (exporting) return;
    haptics.light();
    void exportPdf({ operation, table }).catch((e: unknown) => {
      if (e instanceof ReportEmptyError) {
        toast.info('No hay registros para exportar con los filtros actuales');
      } else {
        toast.error('No se pudo generar el reporte de auditoría');
      }
    });
  }, [exportPdf, exporting, operation, table, toast]);

  const handleItemPress = useCallback(
    (item: IAuditLogItem) => {
      nav.navigate('AuditDetail', { id: item.id });
    },
    [nav],
  );

  const hasFilters = operation !== 'all' || table !== 'all';
  const showLoadingState = loading && items.length === 0;
  const showErrorState = !!error && items.length === 0 && !loading;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Auditoria del sistema"
        onBack={() => nav.goBack()}
        rightIcon={
          exporting ? (
            <ActivityIndicator size="small" color={colors.primaryRed} />
          ) : (
            <FileText size={22} color={colors.textPrimary} strokeWidth={2} />
          )
        }
        onRightPress={handleExport}
      />

      <View style={styles.filterRow}>
        <FilterChips
          chips={OPERATION_CHIPS}
          activeKey={operation}
          onSelect={(key) => setOperation(key as AuditOperationFilter)}
        />
      </View>
      <View style={styles.filterRow}>
        <FilterChips
          chips={TABLE_CHIPS}
          activeKey={table}
          onSelect={(key) => setTable(key as AuditTableFilter)}
        />
      </View>

      {showErrorState ? (
        <ErrorState message={error ?? undefined} onRetry={refetch} />
      ) : (
        <FlatList<IAuditLogItem>
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AuditLogItem item={item} onPress={handleItemPress} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading && items.length > 0}
              onRefresh={handleRefresh}
              tintColor={colors.primaryRed}
              colors={[colors.primaryRed]}
            />
          }
          onEndReached={() => {
            if (hasMore && !loadingMore) loadMore();
          }}
          onEndReachedThreshold={0.4}
          contentContainerStyle={[
            styles.list,
            items.length === 0 && styles.listEmpty,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.primaryRed} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            showLoadingState ? (
              <SkeletonList count={8} renderItem={() => <AuditRowSkeleton />} />
            ) : (
              <EmptyState
                icon={hasFilters ? SearchX : History}
                title={
                  hasFilters
                    ? 'Sin resultados con los filtros aplicados'
                    : 'No hay actividad registrada'
                }
                description={
                  hasFilters
                    ? 'Ajusta los filtros para ver mas resultados'
                    : 'Las acciones realizadas en el sistema apareceran aqui'
                }
              />
            )
          }
        />
      )}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xs },
    list: { flexGrow: 1 },
    listEmpty: { justifyContent: 'center' },
    footer: { paddingVertical: spacing.lg, alignItems: 'center' },
    skelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: spacing.xl,
      paddingVertical: 12,
    },
    skelInfo: { flex: 1, gap: 6 },
  });
