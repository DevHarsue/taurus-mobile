import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';
import { useCompleteProfile } from '@features/members/hooks/useCompleteProfile';
import { useConfirm } from '@hooks/useConfirm';
import {
  completeProfileSchema,
  type CompleteProfileFormValues,
} from '@features/members/schemas/completeProfile.schema';
import { typography, spacing, type Colors } from '@theme/index';

interface Props {
  onCompleted: () => void;
}

export default function CompleteProfileScreen({ onCompleted }: Props) {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const { confirm } = useConfirm();
  const { mutate, loading, error } = useCompleteProfile();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { control, handleSubmit, formState: { errors } } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { cedula: '', phone: '' },
  });

  const onSubmit = async (values: CompleteProfileFormValues) => {
    try {
      await mutate(values);
      onCompleted();
    } catch {
      // error ya viene capturado por useMutation y se muestra abajo
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardScreen contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Completa tu perfil</Text>
        <Text style={styles.description}>
          Necesitamos tu cédula y teléfono para terminar el registro de tu cuenta de Taurus.
        </Text>

        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}

        {error && <AlertBanner message={error} variant="error" />}

        <Controller
          control={control}
          name="cedula"
          render={({ field: { onChange, value } }) => (
            <Input
              label="CÉDULA"
              placeholder="12345678"
              value={value}
              onChangeText={onChange}
              error={errors.cedula?.message}
              variant="dark"
              keyboardType="numeric"
              maxLength={8}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <Input
              label="TELÉFONO"
              placeholder="584141771490"
              value={value}
              onChangeText={onChange}
              error={errors.phone?.message}
              variant="dark"
              keyboardType="phone-pad"
              maxLength={12}
            />
          )}
        />

        <GradientButton title="Guardar  →" onPress={handleSubmit(onSubmit)} loading={loading} />

        <Pressable
          style={styles.logoutBtn}
          onPress={async () => {
            const ok = await confirm({
              title: 'Cerrar sesion',
              message: '¿Seguro que quieres salir?',
              confirmLabel: 'Salir',
              cancelLabel: 'Cancelar',
              destructive: true,
            });
            if (ok) void logout();
          }}
        >
          <LogOut size={18} color={colors.badgeExpired} strokeWidth={2} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </KeyboardScreen>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundForm },
  scrollContent: { padding: spacing.xxl, gap: 12 },
  title: {
    fontFamily: typography.titleS.fontFamily,
    fontSize: typography.titleS.fontSize,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 4,
  },
  email: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
  },
  logoutText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.badgeExpired,
    fontWeight: '600',
  },
});
