import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenHeader } from '@components/ScreenHeader';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { useUpdatePlan } from '../hooks/useUpdatePlan';
import { createPlanSchema, type CreatePlanFormValues } from '../schemas/plan.schema';
import { colors, typography, spacing } from '@theme/index';
import type { EditPlanScreenProps } from '@navigation/types';

export default function EditPlanScreen({ route }: EditPlanScreenProps) {
  const { plan } = route.params;
  const nav = useNavigation();
  const { mutate, loading, error } = useUpdatePlan();

  const { control, handleSubmit, formState: { errors } } = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: plan.name,
      durationDays: String(plan.durationDays),
      referencePrice: String(plan.referencePrice),
      isActive: plan.isActive,
    },
  });

  const onSubmit = async (values: CreatePlanFormValues) => {
    await mutate({
      id: plan.id,
      body: {
        name: values.name,
        durationDays: Number(values.durationDays),
        referencePrice: values.referencePrice ? Number(values.referencePrice) : 0,
        isActive: values.isActive,
      },
    });
    nav.goBack();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Editar Plan"
        onBack={() => nav.goBack()}
        backgroundColor={colors.backgroundForm}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Modificar Plan</Text>

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
            <Input label="DURACION (DIAS)" placeholder="30" value={value ?? ''} onChangeText={onChange} error={errors.durationDays?.message} variant="dark" keyboardType="numeric" />
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

        <GradientButton title="Guardar cambios" onPress={handleSubmit(onSubmit)} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundForm },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xxl, gap: 8 },
  title: { fontFamily: typography.titleS.fontFamily, fontSize: typography.titleS.fontSize, color: colors.textPrimary, marginBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  switchLabel: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1, color: colors.textMuted },
});
