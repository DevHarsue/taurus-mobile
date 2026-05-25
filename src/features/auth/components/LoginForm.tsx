import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { useLogin } from '@features/auth/hooks/useLogin';
import { useGoogleLogin } from '@features/auth/hooks/useGoogleLogin';
import { colors, typography, spacing } from '@theme/index';
import type { AuthStackParamList } from '@navigation/types';

const schema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type FormValues = z.infer<typeof schema>;
type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function LoginForm() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { submit, loading, error } = useLogin();
  const googleLogin = useGoogleLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <KeyboardScreen
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 40 }]}
      extraBottomPadding={32}
    >
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoText}>T</Text>
        </View>
        <Text style={styles.brandName}>TAURUS</Text>
        <Text style={styles.brandSub}>PREMIUM PERFORMANCE</Text>
      </View>

      {/* Error */}
      {!!(error || googleLogin.error) && (
        <AlertBanner message={error || googleLogin.error || ''} variant="error" />
      )}

      {/* Form */}
      <View style={styles.formSection}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="EMAIL"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="nombre@ejemplo.com"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="CONTRASEÑA"
              showToggle
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />
      </View>

      {/* CTA */}
      <GradientButton
        title="Iniciar sesion"
        onPress={handleSubmit((values) => submit(values))}
        loading={loading}
      />

      {/* Forgot Password */}
      <Pressable onPress={() => nav.navigate('ForgotPassword')}>
        <Text style={styles.forgotLink}>¿Olvidaste tu contrasena?</Text>
      </Pressable>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>O ACCEDE CON</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialRow}>
        <Pressable 
          style={styles.socialBtn}
          onPress={googleLogin.signIn}
          disabled={googleLogin.loading}
        >
          <Text style={styles.socialIcon}>G</Text>
          <Text style={styles.socialText}>
            {googleLogin.loading ? 'CARGANDO...' : 'GOOGLE'}
          </Text>
        </Pressable>
      </View>

    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 24,
  },
  logoSection: {
    alignItems: 'center',
    gap: 4,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontFamily: typography.titleM.fontFamily,
    fontSize: 24,
    color: colors.primaryRed,
  },
  brandName: {
    fontFamily: typography.titleM.fontFamily,
    fontSize: typography.titleM.fontSize,
    color: colors.textPrimary,
    letterSpacing: 3,
  },
  brandSub: {
    fontFamily: typography.labelM.fontFamily,
    fontSize: typography.labelM.fontSize,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  formSection: {
    gap: 4,
  },
  forgotLink: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textPrimaryAlpha50,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontFamily: typography.labelM.fontFamily,
    fontSize: typography.labelM.fontSize,
    letterSpacing: 1,
    color: colors.textPrimaryAlpha40,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.backgroundCard,
  },
  socialIcon: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  socialText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textPrimaryAlpha50,
  },
  registerLink: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.primaryRed,
  },
});
