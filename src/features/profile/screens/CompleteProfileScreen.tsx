import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { useAuth } from '@hooks/useAuth';
import { useCompleteProfile } from '@features/members/hooks/useCompleteProfile';
import {
  completeProfileSchema,
  type CompleteProfileFormValues,
} from '@features/members/schemas/completeProfile.schema';
import { colors, typography, spacing } from '@theme/index';

interface Props {
  onCompleted: () => void;
}

export default function CompleteProfileScreen({ onCompleted }: Props) {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const { mutate, loading, error } = useCompleteProfile();

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
          onPress={() => {
            const confirmAndLogout = () => {
              void logout();
            };
            if (Platform.OS === 'web') {
              if (window.confirm('¿Cerrar sesión?')) confirmAndLogout();
            } else {
              const { Alert } = require('react-native');
              Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', style: 'destructive', onPress: confirmAndLogout },
              ]);
            }
          }}
        >
          <LogOut size={18} color={colors.badgeExpired} strokeWidth={2} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </KeyboardScreen>
    </View>
  );
}

const styles = StyleSheet.create({
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
