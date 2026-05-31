import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radii, spacing, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';

type Variant = 'info' | 'warning' | 'error';

type Props = {
  message: string;
  variant?: Variant;
};

export function AlertBanner({ message, variant = 'info' }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const backgroundColor =
    variant === 'warning' ? colors.warning : variant === 'error' ? colors.badgeExpired : '#DBEAFE';
  const textColor = variant === 'info' ? '#1E40AF' : colors.white;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      padding: spacing.sm,
      borderRadius: radii.sm,
      marginVertical: spacing.sm
    },
    text: {
      color: colors.white,
      fontWeight: '600'
    }
  });
