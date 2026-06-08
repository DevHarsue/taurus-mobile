import React, { useState, useMemo } from 'react';
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
import { useForgotPassword } from '../hooks/useForgotPassword';
import { useToast } from '@hooks/useToast';
import { emailSchema } from '@utils/validators';
import { typography, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';
import type { AuthStackParamList } from '@navigation/types';

const schema = z.object({ email: emailSchema });
type FormValues = z.infer<typeof schema>;
type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function ForgotPasswordScreen() {
  const nav = useNavigation<Nav>();
  const { mutate, loading, error } = useForgotPassword();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await mutate(values);
    setSuccessMessage(result.message);
    toast.success('Si el email existe, recibirás instrucciones');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Recuperar contraseña" onBack={() => nav.goBack()} />

      <KeyboardScreen contentContainerStyle={styles.scrollContent} extraBottomPadding={32}>
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>T</Text>
          </View>
        </View>

        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.description}>
          Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
        </Text>

        {!!error && <AlertBanner message={error} variant="error" />}
        {!!successMessage && (
          <>
            <AlertBanner message={successMessage} variant="info" />
            <Pressable
              style={styles.secondaryAction}
              onPress={() => nav.navigate('ResetPassword')}
            >
              <Text style={styles.secondaryActionText}>Ya tengo un codigo de restablecimiento</Text>
            </Pressable>
          </>
        )}

        {!successMessage && (
          <>
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

            <GradientButton
              title="Enviar enlace"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
            />
          </>
        )}

        <Pressable onPress={() => nav.navigate('Login')} style={styles.backLink}>
          <Text style={styles.backLinkText}>Volver al login</Text>
        </Pressable>
      </KeyboardScreen>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 24, gap: 16 },
  logoSection: { alignItems: 'center', marginBottom: 8 },
  logoIcon: {
    width: 48, height: 48, borderRadius: 8, backgroundColor: colors.backgroundCard,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: typography.titleM.fontFamily, fontSize: 24, color: colors.primaryRed },
  title: { fontFamily: typography.headingL.fontFamily, fontSize: typography.headingL.fontSize, color: colors.textPrimary, textAlign: 'center' },
  description: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  backLink: { alignItems: 'center', paddingVertical: 12 },
  backLinkText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.primaryRed },
  secondaryAction: { alignItems: 'center', paddingVertical: 8 },
  secondaryActionText: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.primaryRed, textDecorationLine: 'underline' },
});
