import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenHeader } from '@components/ScreenHeader';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { useRegister } from '../hooks/useRegister';
import { useToast } from '@hooks/useToast';
import { registerSchema, type RegisterFormValues } from '../schemas/register.schema';
import { typography, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';
import type { AuthStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function RegisterScreen() {
  const nav = useNavigation<Nav>();
  const { mutate, loading, error } = useRegister();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await mutate({ email: values.email, password: values.password });
    toast.success('Cuenta creada, ya puedes iniciar sesion');
    nav.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Crear cuenta" onBack={() => nav.goBack()} />

      <KeyboardScreen contentContainerStyle={styles.scrollContent} extraBottomPadding={32}>
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <Text style={styles.brandName}>TAURUS</Text>
        </View>

        <Text style={styles.title}>Crear tu cuenta</Text>

        {!!error && <AlertBanner message={error} variant="error" />}

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
              label="CONTRASENA"
              showToggle
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="CONFIRMAR CONTRASENA"
              showToggle
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <GradientButton
          title="Crear cuenta"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
          <Pressable onPress={() => nav.navigate('Login')}>
            <Text style={styles.loginLink}>INICIA SESION</Text>
          </Pressable>
        </View>
      </KeyboardScreen>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 24, gap: 16 },
  logoSection: { alignItems: 'center', gap: 4, marginBottom: 8 },
  logoIcon: {
    width: 48, height: 48, borderRadius: 8, backgroundColor: colors.backgroundCard,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: typography.titleM.fontFamily, fontSize: 24, color: colors.primaryRed },
  brandName: { fontFamily: typography.titleM.fontFamily, fontSize: typography.titleM.fontSize, color: colors.textPrimary, letterSpacing: 3 },
  title: { fontFamily: typography.headingL.fontFamily, fontSize: typography.headingL.fontSize, color: colors.textPrimary, textAlign: 'center' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textPrimaryAlpha50 },
  loginLink: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.primaryRed },
});
