import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/index';
import { useMembers } from '@features/members/hooks/useMembers';
import { EmptyState } from '@components/EmptyState';

export default function MembersListScreen() {
  const { data, loading, error } = useMembers();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Miembros</Text>
      {loading && <Text style={styles.meta}>Cargando…</Text>}
      {!!error && <Text style={styles.meta}>{error}</Text>}

      {!loading && data?.data?.length ? (
        <FlatList
          data={data.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text>{item.name}</Text>}
        />
      ) : (
        !loading && <EmptyState title="Sin miembros" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.bgLight },
  title: { fontSize: 20, fontWeight: '700' },
  meta: { color: theme.colors.textSecondary, marginTop: 8 }
});