import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@hooks/useTheme';
import { radii, sizes, typography, type Colors } from '@theme/index';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

type VariantStyle = { bg: string; fg: string; border?: string };

function variantStyles(colors: Colors): Record<ButtonVariant, VariantStyle> {
  return {
    primary: { bg: colors.primaryRed, fg: colors.white },
    outline: { bg: 'transparent', fg: colors.primaryRed, border: colors.primaryRed },
    ghost: { bg: 'transparent', fg: colors.primaryRed },
    danger: { bg: 'transparent', fg: colors.badgeExpired, border: colors.badgeExpired },
  };
}

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  icon,
  style,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = disabled || loading;
  const v = variantStyles(colors)[variant];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg },
        v.border ? { borderWidth: 1.5, borderColor: v.border } : null,
        isDisabled && styles.disabled,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: v.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (_colors: Colors) =>
  StyleSheet.create({
    button: {
      height: sizes.buttonHeight,
      borderRadius: radii.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontFamily: typography.bodyL.fontFamily,
      fontSize: typography.bodyL.fontSize,
      letterSpacing: 1,
      fontWeight: '600',
    },
  });
