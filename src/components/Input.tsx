import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radii, sizes, typography } from '@theme/index';

type InputVariant = 'light' | 'dark';

type Props = TextInputProps & {
  label: string;
  error?: string;
  variant?: InputVariant;
  showToggle?: boolean;
};

export function Input({ label, error, variant = 'light', showToggle, style, ...props }: Props) {
  const bgColor = variant === 'dark' ? colors.inputBgAlt : colors.inputBg;
  const [secure, setSecure] = useState(true);

  const inputStyle = [
    styles.input,
    { backgroundColor: bgColor },
    showToggle && styles.inputWithToggle,
    !!error && styles.inputError,
    style,
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          {...props}
          secureTextEntry={showToggle ? secure : props.secureTextEntry}
          style={inputStyle}
          placeholderTextColor={colors.textPrimaryAlpha40}
        />
        {showToggle && (
          <Pressable style={styles.toggleBtn} onPress={() => setSecure((v) => !v)} hitSlop={8}>
            {secure ? (
              <EyeOff size={20} color={colors.textPrimaryAlpha50} />
            ) : (
              <Eye size={20} color={colors.textPrimaryAlpha50} />
            )}
          </Pressable>
        )}
      </View>
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
  inputWrapper: {
    position: 'relative' as const,
  },
  input: {
    height: sizes.inputHeight,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    fontSize: typography.bodySM.fontSize,
    fontFamily: typography.bodySM.fontFamily,
    color: colors.textPrimary,
  },
  inputWithToggle: {
    paddingRight: 48,
  },
  toggleBtn: {
    position: 'absolute' as const,
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center' as const,
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
