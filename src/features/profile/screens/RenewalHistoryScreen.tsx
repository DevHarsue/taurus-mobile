import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/index';
import { useRenewalHistory } from '@features/profile/hooks/useRenewalHistory';

export default function RenewalHistoryScreen() {
  const { loading, error } = useRenewalHistory();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de renovaciones</Text>
      <Text style={styles.meta}>{loading ? 'Cargando…' : error ? error : 'OK'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.bgLight },
  title: { fontSize: 20, fontWeight: '700' },
  meta: { color: theme.colors.textSecondary, marginTop: 8 }
});