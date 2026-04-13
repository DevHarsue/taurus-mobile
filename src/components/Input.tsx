import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { theme } from '@theme/index';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, !!error && styles.inputError, style]}
        placeholderTextColor={theme.colors.textSecondary}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12
  },
  label: {
    marginBottom: 6,
    color: theme.colors.black,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: theme.radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.white
  },
  inputError: {
    borderColor: theme.colors.badgeExpired
  },
  error: {
    marginTop: 6,
    color: theme.colors.badgeExpired
  }
});