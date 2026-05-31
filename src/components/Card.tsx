import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { radii, spacing, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';

type Props = ViewProps;

export function Card({ style, ...props }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View {...props} style={[styles.card, style]} />;
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.md,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2
    }
  });
