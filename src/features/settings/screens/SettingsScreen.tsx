import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useToast } from '@hooks/useToast';
import { useTheme } from '@hooks/useTheme';
import { confirmDialog } from '@utils/confirmDialog';
import { passwordSchema } from '@utils/validators';
import { typography, spacing, type Colors } from '@theme/index';
import type { ThemeMode } from '@context/ThemeContext';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'contraseña actual requerida'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Claro' },
  { mode: 'dark', label: 'Oscuro' },
  { mode: 'system', label: 'Sistema' },
];

export default function SettingsScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { mutate, loading, error } = useChangePassword();
  const { toast } = useToast();
  const { colors, mode, setMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { control, handleSubmit, formState: { errors }, reset: resetForm } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onChangePassword = async (values: ChangePasswordFormValues) => {
    await mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    toast.success('contraseña actualizada');
    resetForm();
  };

  const handleLogout = async () => {
    const ok = await confirmDialog('Cerrar sesion', '¿Seguro que quieres salir?', {
      destructive: true,
      confirmLabel: 'Salir',
    });
    if (ok) void logout();
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

        {/* Tema (dark mode) */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Tema</Text>
          <View style={styles.segment}>
            {THEME_OPTIONS.map((opt) => {
              const active = mode === opt.mode;
              return (
                <Pressable
                  key={opt.mode}
                  onPress={() => setMode(opt.mode)}
                  style={[styles.segmentItem, active && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Change Password */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Cambiar contraseña</Text>

          {!!error && <AlertBanner message={error} variant="error" />}

          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="CONTRASEÑA ACTUAL"
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
                label="NUEVA CONTRASEÑA"
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
                label="CONFIRMAR NUEVA CONTRASEÑA"
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
            title="Actualizar contraseña"
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

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundCard },
    scrollContent: { padding: spacing.xl, gap: 16 },
    section: { padding: 20, gap: 12 },
    sectionTitle: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary, marginBottom: 4 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoLabel: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted },
    infoValue: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
    segment: { flexDirection: 'row', backgroundColor: colors.inputBg, borderRadius: 12, padding: 4, gap: 4 },
    segmentItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
    segmentItemActive: { backgroundColor: colors.primaryRed },
    segmentText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textSecondary, fontWeight: '600' },
    segmentTextActive: { color: colors.white },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 8 },
    logoutText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.badgeExpired, fontWeight: '600' },
  });
