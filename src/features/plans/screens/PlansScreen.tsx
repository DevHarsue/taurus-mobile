import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/index';
import { usePlans } from '@features/plans/hooks/usePlans';

export default function PlansScreen() {
  const { data, loading, error } = usePlans();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planes</Text>
      <Text style={styles.meta}>{loading ? 'Cargando…' : error ? error : `Total: ${data?.length ?? 0}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.bgLight },
  title: { fontSize: 20, fontWeight: '700' },
  meta: { color: theme.colors.textSecondary, marginTop: 8 }
});