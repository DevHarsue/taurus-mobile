import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/index';

type Variant = 'info' | 'warning' | 'error';

type Props = {
  message: string;
  variant?: Variant;
};

export function AlertBanner({ message, variant = 'info' }: Props) {
  const backgroundColor =
    variant === 'warning' ? theme.colors.warning : variant === 'error' ? theme.colors.badgeExpired : '#E5E7EB';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    marginVertical: theme.spacing.sm
  },
  text: {
    color: theme.colors.white,
    fontWeight: '600'
  }
});