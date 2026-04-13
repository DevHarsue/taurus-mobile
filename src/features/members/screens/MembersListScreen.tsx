import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { Badge } from '@components/Badge';
import { SearchBar } from '@components/SearchBar';
import { FilterChips, type IFilterChip } from '@components/FilterChips';
import { FAB } from '@components/FAB';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { useMemberSearch } from '../hooks/useMemberSearch';
import { colors, typography, spacing } from '@theme/index';
import type { MembersStackParamList } from '@navigation/types';
import type { MemberListItem } from '@app-types/member';

const FILTERS: IFilterChip[] = [
  { key: '', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'expired', label: 'Vencidos' },
];

type Nav = NativeStackNavigationProp<MembersStackParamList>;

export default function MembersListScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, search, filter, onSearch, onFilter } = useMemberSearch();

  const members = data?.data ?? [];

  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name="Taurus" backgroundColor={colors.primaryRed} />
            <Text style={styles.greeting}>Hola, Taurus</Text>
          </View>
        }
        rightIcon={<Text style={styles.bellIcon}>🔔</Text>}
      />

      <View style={styles.content}>
        <SearchBar value={search} onChangeText={onSearch} placeholder="Search members..." />
        <FilterChips chips={FILTERS} activeKey={filter} onSelect={onFilter} />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable style={styles.memberRow} onPress={() => nav.navigate('MemberDetail', { id: item.id })}>
                <Avatar size={42} name={item.name} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberCedula}>ID: {item.cedula}</Text>
                </View>
                <Badge
                  label={item.status === 'active' ? 'ACTIVO' : 'VENCIDO'}
                  variant={item.status === 'active' ? 'active' : 'expired'}
                  badgeStyle="pill"
                />
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Sin miembros</Text>}
          />
        )}
      </View>

      <FAB onPress={() => nav.navigate('CreateMember')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary },
  bellIcon: { fontSize: 20 },
  content: { flex: 1, paddingHorizontal: spacing.xl, gap: 16 },
  list: { paddingBottom: 120 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontFamily: typography.bodyM.fontFamily, fontSize: typography.bodyM.fontSize, color: colors.textPrimary },
  memberCedula: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textPrimaryAlpha50 },
  empty: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, textAlign: 'center', paddingVertical: 40 },
});
