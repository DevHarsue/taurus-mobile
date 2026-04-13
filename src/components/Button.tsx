import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type ViewStyle } from 'react-native';
import { theme } from '@theme/index';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, disabled, loading, style }: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, isDisabled && styles.buttonDisabled, style]}
    >
      {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primaryRed,
    borderRadius: theme.radii.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  text: {
    color: theme.colors.white,
    fontWeight: '600'
  }
});