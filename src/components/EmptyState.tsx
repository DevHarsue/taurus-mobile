import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { spacing, typography, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';
import { GradientButton } from './GradientButton';

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      {Icon && (
        <Icon size={48} color={colors.textMuted} strokeWidth={1.5} />
      )}
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <View style={styles.button}>
          <GradientButton title={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      padding: spacing.xxl,
      alignItems: 'center',
      gap: spacing.md,
    },
    title: {
      fontFamily: typography.headingXS.fontFamily,
      fontSize: typography.headingXS.fontSize,
      color: colors.textPrimary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    description: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    button: {
      width: 220,
      marginTop: spacing.sm,
    },
  });
