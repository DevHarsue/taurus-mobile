import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/index';

export default function CreateMemberScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear miembro</Text>
      <Text style={styles.meta}>TODO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.bgLight },
  title: { fontSize: 20, fontWeight: '700' },
  meta: { color: theme.colors.textSecondary, marginTop: 8 }
});