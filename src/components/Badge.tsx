import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/index';

type Variant = 'active' | 'expired' | 'neutral' | 'warning';

type Props = {
  label: string;
  variant?: Variant;
};

export function Badge({ label, variant = 'neutral' }: Props) {
  const backgroundColor =
    variant === 'active'
      ? theme.colors.badgeActive
      : variant === 'expired'
        ? theme.colors.badgeExpired
        : variant === 'warning'
          ? theme.colors.warning
          : '#E5E7EB';

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  text: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 12
  }
});