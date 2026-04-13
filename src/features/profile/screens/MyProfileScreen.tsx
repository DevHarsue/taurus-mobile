import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/index';
import { useMyProfile } from '@features/profile/hooks/useMyProfile';
import { Button } from '@components/Button';
import { useAuth } from '@hooks/useAuth';

export default function MyProfileScreen() {
  const { user, logout } = useAuth();
  const { loading, error } = useMyProfile();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi perfil</Text>
      <Text style={styles.meta}>{loading ? 'Cargando…' : error ? error : user?.email ?? ''}</Text>
      <Button title="Cerrar sesión" onPress={() => logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.bgLight },
  title: { fontSize: 20, fontWeight: '700' },
  meta: { color: theme.colors.textSecondary, marginVertical: 8 }
});