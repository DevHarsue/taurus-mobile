import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { FilterChips } from '@components/FilterChips';
import { AccessLogItem } from '../components/AccessLogItem';
import { useAccessLog, type AccessLogFilter } from '../hooks/useAccessLog';
import { colors, typography, spacing } from '@theme/index';
import type { IAccessLogItem } from '@app-types/access';

const FILTER_CHIPS = [
  { key: 'all', label: 'Todos' },
  { key: 'granted', label: 'Concedidos' },
  { key: 'denied', label: 'Denegados' },
];

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
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>Sin registros de acceso</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  list: { flexGrow: 1 },
  empty: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
