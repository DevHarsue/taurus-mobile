import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenHeader } from '@components/ScreenHeader';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { useCreatePlan } from '../hooks/useCreatePlan';
import { useToast } from '@hooks/useToast';
import { useTheme } from '@hooks/useTheme';
import { createPlanSchema, type CreatePlanFormValues } from '../schemas/plan.schema';
import { typography, spacing, type Colors } from '@theme/index';

export default function CreatePlanScreen() {
  const nav = useNavigation();
  const { mutate, loading, error } = useCreatePlan();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { control, handleSubmit, formState: { errors } } = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { name: '', durationDays: '', referencePrice: '', isActive: true },
  });

  const onSubmit = async (values: CreatePlanFormValues) => {
    await mutate({
      name: values.name,
      durationDays: Number(values.durationDays),
      referencePrice: values.referencePrice ? Number(values.referencePrice) : 0,
      isActive: values.isActive,
    });
    toast.success('Plan creado correctamente');
    nav.goBack();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Crear Plan"
        onBack={() => nav.goBack()}
        backgroundColor={colors.backgroundForm}
      />

      <KeyboardScreen contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Nuevo Plan</Text>

        {error && <AlertBanner message={error} variant="error" />}

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input label="NOMBRE DEL PLAN" placeholder="Ej. Plan Mensual" value={value} onChangeText={onChange} error={errors.name?.message} variant="dark" />
          )}
        />
        <Controller
          control={control}
          name="durationDays"
          render={({ field: { onChange, value } }) => (
            <Input label="DURACION (DIAS)" placeholder="30" value={value} onChangeText={onChange} error={errors.durationDays?.message} variant="dark" keyboardType="numeric" />
          )}
        />
        <Controller
          control={control}
          name="referencePrice"
          render={({ field: { onChange, value } }) => (
            <Input label="PRECIO REFERENCIA" placeholder="0.00" value={value ?? ''} onChangeText={onChange} error={errors.referencePrice?.message} variant="dark" keyboardType="numeric" />
          )}
        />
        <Controller
          control={control}
          name="isActive"
          render={({ field: { onChange, value } }) => (
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>PLAN ACTIVO</Text>
              <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primaryRed }} />
            </View>
          )}
        />

        <GradientButton title="Crear plan" onPress={handleSubmit(onSubmit)} loading={loading} />
      </KeyboardScreen>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundForm },
  scrollContent: { padding: spacing.xxl, gap: 8 },
  title: { fontFamily: typography.titleS.fontFamily, fontSize: typography.titleS.fontSize, color: colors.textPrimary, marginBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  switchLabel: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1, color: colors.textMuted },
});
