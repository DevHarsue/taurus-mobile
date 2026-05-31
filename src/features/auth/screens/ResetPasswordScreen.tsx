import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenHeader } from '@components/ScreenHeader';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { useResetPassword } from '../hooks/useResetPassword';
import { useToast } from '@hooks/useToast';
import { passwordSchema } from '@utils/validators';
import { colors, typography } from '@theme/index';
import type { AuthStackParamList } from '@navigation/types';

const schema = z
  .object({
    token: z.string().min(1, 'Token requerido'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;
type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function ResetPasswordScreen() {
  const nav = useNavigation<Nav>();
  const { mutate, loading, error } = useResetPassword();
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    await mutate({ token: values.token, newPassword: values.newPassword });
    toast.success('Contrasena actualizada, ya puedes iniciar sesion');
    nav.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Nueva contrasena" onBack={() => nav.goBack()} />

      <KeyboardScreen contentContainerStyle={styles.scrollContent} extraBottomPadding={32}>
        <Text style={styles.title}>Restablecer contrasena</Text>
        <Text style={styles.description}>
          Ingresa el token que recibiste y tu nueva contrasena.
        </Text>

        {!!error && <AlertBanner message={error} variant="error" />}

        <Controller
          control={control}
          name="token"
          render={({ field: { onChange, value } }) => (
            <Input
              label="TOKEN DE RESTABLECIMIENTO"
              placeholder="a1b2c3d4-e5f6-..."
              value={value}
              onChangeText={onChange}
              error={errors.token?.message}
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="NUEVA CONTRASENA"
              showToggle
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              error={errors.newPassword?.message}
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
          title="Cambiar contrasena"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />

        <Pressable onPress={() => nav.navigate('Login')} style={styles.backLink}>
          <Text style={styles.backLinkText}>Volver al login</Text>
        </Pressable>
      </KeyboardScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { paddingHorizontal: 24, gap: 16 },
  title: { fontFamily: typography.headingL.fontFamily, fontSize: typography.headingL.fontSize, color: colors.textPrimary, textAlign: 'center' },
  description: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  backLink: { alignItems: 'center', paddingVertical: 12 },
  backLinkText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.primaryRed },
});
