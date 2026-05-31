import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';
import { LoginForm } from '@features/auth/components/LoginForm';

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <LoginForm />
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
