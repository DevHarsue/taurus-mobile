import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Users } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { Badge } from '@components/Badge';
import { SearchBar } from '@components/SearchBar';
import { FilterChips, type IFilterChip } from '@components/FilterChips';
import { FAB } from '@components/FAB';
import { EmptyState } from '@components/EmptyState';
import { Skeleton, SkeletonList } from '@components/Skeleton';
import { useGreeting } from '@hooks/useGreeting';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import { useMemberSearch } from '../hooks/useMemberSearch';
import { typography, spacing, type Colors } from '@theme/index';
import type { MembersStackParamList } from '@navigation/types';

const FILTERS: IFilterChip[] = [
  { key: '', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'expired', label: 'Vencidos' },
  { key: 'none', label: 'Sin Plan' },
];

type Nav = NativeStackNavigationProp<MembersStackParamList>;

function MemberRowSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.memberRow}>
      <Skeleton width={42} height={42} borderRadius={21} />
      <View style={styles.memberInfo}>
        <Skeleton width="55%" height={14} borderRadius={7} />
        <Skeleton width="35%" height={11} borderRadius={6} />
      </View>
      <Skeleton width={64} height={24} borderRadius={12} />
    </View>
  );
}

export default function MembersListScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { displayName } = useGreeting();
  const {
    items,
    loading,
    loadingMore,
    loadMore,
    refetch,
    search,
    filter,
    onSearch,
    onFilter,
  } = useMemberSearch();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const members = items;

  const handleRefresh = useCallback(() => {
    haptics.light();
    refetch();
  }, [refetch]);

  const hasFilter = search.trim().length > 0 || filter.length > 0;
  const isInitial = loading && members.length === 0;
  const isRefreshing = loading && members.length > 0;

  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name={displayName} backgroundColor={colors.primaryRed} />
            <Text style={styles.greeting}>Hola, {displayName}</Text>
          </View>
        }
      />

      <View style={styles.content}>
        <SearchBar value={search} onChangeText={onSearch} placeholder="Buscar miembros..." />
        <FilterChips chips={FILTERS} activeKey={filter} onSelect={onFilter} />

        {isInitial ? (
          <SkeletonList count={8} gap={0} renderItem={() => <MemberRowSkeleton />} />
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom + 100 },
              members.length === 0 && styles.listEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primaryRed}
                colors={[colors.primaryRed]}
              />
            }
            renderItem={({ item }) => (
              <Pressable style={styles.memberRow} onPress={() => nav.navigate('MemberDetail', { id: item.id })}>
                <Avatar size={42} name={item.name} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberCedula}>ID: {item.cedula}</Text>
                </View>
                <Badge
                  label={item.subscriptionStatus === 'active' ? 'ACTIVO' : item.subscriptionStatus === 'expired' ? 'VENCIDO' : 'SIN PLAN'}
                  variant={item.subscriptionStatus === 'active' ? 'active' : item.subscriptionStatus === 'expired' ? 'expired' : 'neutral'}
                  badgeStyle="pill"
                />
              </Pressable>
            )}
            ListEmptyComponent={
              hasFilter ? (
                <EmptyState
                  icon={Search}
                  title="No se encontraron miembros"
                  description="Prueba con otros filtros o terminos de busqueda"
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No hay miembros registrados"
                  description="Crea tu primer miembro para empezar"
                  actionLabel="Crear primer miembro"
                  onAction={() => nav.navigate('CreateMember')}
                />
              )
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator color={colors.primaryRed} style={styles.footer} />
              ) : null
            }
          />
        )}
      </View>

      <FAB onPress={() => nav.navigate('CreateMember')} />
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary },
  content: { flex: 1, paddingHorizontal: spacing.xl, gap: 16 },
  list: {},
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontFamily: typography.bodyM.fontFamily, fontSize: typography.bodyM.fontSize, color: colors.textPrimary },
  memberCedula: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textPrimaryAlpha50 },
  footer: { paddingVertical: 20 },
});
