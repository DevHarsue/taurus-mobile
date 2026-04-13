import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/index';
import { useMemberDetail } from '@features/members/hooks/useMemberDetail';

export default function MemberDetailScreen({ route }: { route: { params: { id: string } } }) {
  const { data, loading, error } = useMemberDetail(route.params.id);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle miembro</Text>
      <Text style={styles.meta}>{loading ? 'Cargando…' : error ? error : data?.name ?? ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.bgLight },
  title: { fontSize: 20, fontWeight: '700' },
  meta: { color: theme.colors.textSecondary, marginTop: 8 }
});