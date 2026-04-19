import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenHeader } from '@components/ScreenHeader';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { useCreateMember } from '../hooks/useCreateMember';
import { createMemberSchema, type CreateMemberFormValues } from '../schemas/createMember.schema';
import { colors, typography, spacing } from '@theme/index';

export default function CreateMemberScreen() {
  const nav = useNavigation();
  const { mutate, loading, error } = useCreateMember();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateMemberFormValues>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: { name: '', cedula: '', email: '', phone: '', password: '', fingerprintId: '' },
  });

  const onSubmit = async (values: CreateMemberFormValues) => {
    const result = await mutate(values);
    if (result.temporaryPassword) {
      if (Platform.OS === 'web') {
        window.alert(`Contrasena temporal: ${result.temporaryPassword}\n\nComparta esta contrasena con el miembro para su primer acceso.`);
        nav.goBack();
      } else {
        const { Alert } = require('react-native');
        Alert.alert(
          'Miembro registrado',
          `Contrasena temporal: ${result.temporaryPassword}\n\nComparta esta contrasena con el miembro para su primer acceso.`,
          [{ text: 'OK', onPress: () => nav.goBack() }],
        );
      }
    } else {
      nav.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Registrar Miembro"
        onBack={() => nav.goBack()}
        rightIcon={<Text style={styles.stepText}>PASO 1 DE 3</Text>}
        backgroundColor={colors.backgroundForm}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Informacion Personal</Text>
        <Text style={styles.description}>
          Complete los datos basicos para iniciar el proceso de membresia del nuevo atleta.
        </Text>

        {error && <AlertBanner message={error} variant="error" />}

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input label="NOMBRE COMPLETO" placeholder="Ej. Juan Perez" value={value} onChangeText={onChange} error={errors.name?.message} variant="dark" />
          )}
        />
        <Controller
          control={control}
          name="cedula"
          render={({ field: { onChange, value } }) => (
            <Input label="CEDULA" placeholder="000-0000000-0" value={value} onChangeText={onChange} error={errors.cedula?.message} variant="dark" keyboardType="numeric" />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <Input label="TELEFONO" placeholder="+508 0000-0000" value={value} onChangeText={onChange} error={errors.phone?.message} variant="dark" keyboardType="phone-pad" />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input label="EMAIL" placeholder="usuario@taurus.com" value={value} onChangeText={onChange} error={errors.email?.message} variant="dark" keyboardType="email-address" autoCapitalize="none" />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input label="CONTRASENA (OPCIONAL)" placeholder="Dejar vacio para generar automaticamente" value={value} onChangeText={onChange} error={errors.password?.message} variant="dark" secureTextEntry />
          )}
        />

        {/* Photo placeholder */}
        <View style={styles.photoSection}>
          <View style={styles.photoIcon}>
            <Text style={styles.photoEmoji}>📷</Text>
          </View>
          <View style={styles.photoInfo}>
            <Text style={styles.photoTitle}>Foto de Perfil</Text>
            <Text style={styles.photoDesc}>Se capturara en el siguiente paso para el carnet digital QR.</Text>
          </View>
        </View>

        <GradientButton title="Registrar miembro  →" onPress={handleSubmit(onSubmit)} loading={loading} />

        <Text style={styles.terms}>
          SUJETO A TERMINOS Y CONDICIONES DE TAURUS GYM ELITE
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundForm },
  stepText: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1, color: colors.textMuted },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xxl, gap: 8 },
  title: { fontFamily: typography.titleS.fontFamily, fontSize: typography.titleS.fontSize, color: colors.textPrimary, marginBottom: 4 },
  description: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
  photoSection: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: colors.inputBgAlt, borderRadius: 12, marginVertical: 8, alignItems: 'center' },
  photoIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryRed + '20', alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 20 },
  photoInfo: { flex: 1, gap: 4 },
  photoTitle: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
  photoDesc: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted, lineHeight: 16 },
  terms: { fontFamily: typography.labelS.fontFamily, fontSize: 8, letterSpacing: 1, color: colors.textPrimaryAlpha40, textAlign: 'center', marginTop: 16 },
});
