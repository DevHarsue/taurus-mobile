import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { theme } from '@theme/index';
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
  return (
    <View style={styles.container}>
      {Icon && (
        <Icon size={48} color={theme.colors.textMuted} strokeWidth={1.5} />
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

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  title: {
    fontFamily: theme.typography.headingXS.fontFamily,
    fontSize: theme.typography.headingXS.fontSize,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  description: {
    fontFamily: theme.typography.bodySM.fontFamily,
    fontSize: theme.typography.bodySM.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    width: 220,
    marginTop: theme.spacing.sm,
  },
});
