import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { theme } from '@theme/index';

type Props = ViewProps;

export function Card({ style, ...props }: Props) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  }
});