import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@theme/index';
import { LoginForm } from '@features/auth/components/LoginForm';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <LoginForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
