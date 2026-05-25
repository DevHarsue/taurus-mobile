import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { Badge } from '@components/Badge';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { useAuth } from '@hooks/useAuth';
import { useChangePassword } from '../hooks/useChangePassword';
import { passwordSchema } from '@utils/validators';
import { colors, typography, spacing } from '@theme/index';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Contrasena actual requerida'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function SettingsScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { mutate, loading, error } = useChangePassword();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, reset: resetForm } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onChangePassword = async (values: ChangePasswordFormValues) => {
    setSuccessMessage(null);
    const result = await mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    setSuccessMessage(result.message);
    resetForm();
  };

  const handleLogout = () => {
    const confirmAndLogout = () => { void logout(); };
    if (Platform.OS === 'web') {
      if (window.confirm('¿Cerrar sesion?')) confirmAndLogout();
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Cerrar sesion', '¿Seguro que quieres salir?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: confirmAndLogout },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Configuracion" onBack={() => nav.goBack()} />

      <KeyboardScreen
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* User Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Informacion de usuario</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rol</Text>
            <Badge
              label={user?.role === 'admin' ? 'ADMIN' : 'MIEMBRO'}
              variant={user?.role === 'admin' ? 'active' : 'neutral'}
              badgeStyle="pill"
            />
          </View>
        </Card>

        {/* Change Password */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Cambiar contrasena</Text>

          {!!error && <AlertBanner message={error} variant="error" />}
          {!!successMessage && <AlertBanner message={successMessage} variant="info" />}

          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="CONTRASENA ACTUAL"
                showToggle
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                error={errors.currentPassword?.message}
                variant="dark"
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
                variant="dark"
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="CONFIRMAR NUEVA CONTRASENA"
                showToggle
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                variant="dark"
              />
            )}
          />

          <GradientButton
            title="Actualizar contrasena"
            onPress={handleSubmit(onChangePassword)}
            loading={loading}
          />
        </Card>

        {/* App Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Informacion de la app</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </Card>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={colors.badgeExpired} strokeWidth={2} />
          <Text style={styles.logoutText}>Cerrar sesion</Text>
        </Pressable>
      </KeyboardScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundCard },
  scrollContent: { padding: spacing.xl, gap: 16 },
  section: { padding: 20, gap: 12 },
  sectionTitle: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary, marginBottom: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted },
  infoValue: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 8 },
  logoutText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.badgeExpired, fontWeight: '600' },
});
