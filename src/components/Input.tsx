import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radii, sizes, typography } from '@theme/index';

type InputVariant = 'light' | 'dark';

type Props = TextInputProps & {
  label: string;
  error?: string;
  variant?: InputVariant;
};

export function Input({ label, error, variant = 'light', style, ...props }: Props) {
  const bgColor = variant === 'dark' ? colors.inputBgAlt : colors.inputBg;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, { backgroundColor: bgColor }, !!error && styles.inputError, style]}
        placeholderTextColor={colors.textPrimaryAlpha40}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    fontFamily: typography.labelL.fontFamily,
    fontSize: typography.labelL.fontSize,
    letterSpacing: typography.labelL.letterSpacing,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  input: {
    height: sizes.inputHeight,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    fontSize: typography.bodySM.fontSize,
    fontFamily: typography.bodySM.fontFamily,
    color: colors.textPrimary,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.badgeExpired,
  },
  error: {
    marginTop: 6,
    color: colors.badgeExpired,
    fontSize: 12,
  },
});
