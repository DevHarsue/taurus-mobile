import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { FilterChips } from '@components/FilterChips';
import { EmptyState } from '@components/EmptyState';
import { Skeleton, SkeletonList } from '@components/Skeleton';
import { AccessLogItem } from '../components/AccessLogItem';
import { useAccessLog, type AccessLogFilter } from '../hooks/useAccessLog';
import { colors, typography, spacing } from '@theme/index';
import type { IAccessLogItem } from '@app-types/access';

const FILTER_CHIPS = [
  { key: 'all', label: 'Todos' },
  { key: 'granted', label: 'Concedidos' },
  { key: 'denied', label: 'Denegados' },
];

function AccessRowSkeleton() {
  return (
    <View style={styles.skelRow}>
      <Skeleton width={36} height={36} borderRadius={18} />
      <View style={styles.skelInfo}>
        <Skeleton width="50%" height={12} borderRadius={6} />
        <Skeleton width="30%" height={10} borderRadius={5} />
      </View>
    </View>
  );
}

export default function AccessLogScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { data, loading, filter, setFilter, refetch } = useAccessLog();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Registro de Accesos" onBack={() => nav.goBack()} />

      <View style={styles.filterRow}>
        <FilterChips
          chips={FILTER_CHIPS}
          activeKey={filter}
          onSelect={(key) => setFilter(key as AccessLogFilter)}
        />
      </View>

      <FlatList<IAccessLogItem>
        data={data ?? []}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <AccessLogItem item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={colors.primaryRed}
            colors={[colors.primaryRed]}
          />
        }
        contentContainerStyle={[
          styles.list,
          (data?.length ?? 0) === 0 && styles.listEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <SkeletonList count={8} renderItem={() => <AccessRowSkeleton />} />
          ) : (
            <EmptyState
              icon={Activity}
              title="No hay accesos registrados"
              description="Los accesos al gimnasio apareceran aqui"
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  list: { flexGrow: 1 },
  listEmpty: { justifyContent: 'center' },
  skelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.xl, paddingVertical: 12 },
  skelInfo: { flex: 1, gap: 6 },
  empty: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
