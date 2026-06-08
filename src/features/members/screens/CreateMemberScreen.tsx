import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { Card } from '@components/Card';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { useCreateMember } from '../hooks/useCreateMember';
import { useRenew } from '../hooks/useRenew';
import { usePlans } from '@features/plans/hooks/usePlans';
import { useToast } from '@hooks/useToast';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import { createMemberSchema, type CreateMemberFormValues } from '../schemas/createMember.schema';
import { typography, spacing, type Colors } from '@theme/index';
import type { MemberCreated } from '@app-types/member';

export default function CreateMemberScreen() {
  const nav = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const createMutation = useCreateMember();
  const renewMutation = useRenew();
  const plansQuery = usePlans();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateMemberFormValues | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<MemberCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<CreateMemberFormValues>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: { name: '', cedula: '', email: '', phone: '', password: '', fingerprintId: '' },
  });

  const plans = plansQuery.data ?? [];

  const handleStep1Next = (values: CreateMemberFormValues) => {
    setFormData(values);
    setStep(2);
  };

  const handleStep2Next = () => {
    setStep(3);
  };

  const handleStep2Skip = () => {
    setSelectedPlanId(null);
    setStep(3);
  };

  const handleConfirm = async () => {
    if (!formData) return;
    const result = await createMutation.mutate(formData);
    setCreatedResult(result);
    toast.success('Miembro creado correctamente');
    haptics.success();

    if (selectedPlanId && result.id) {
      try {
        await renewMutation.mutate({ memberId: result.id, planId: selectedPlanId });
      } catch {
        setPlanError('Miembro creado, pero no se pudo asignar el plan. Asignelo manualmente desde el detalle.');
      }
    }
  };

  const handleCopy = async () => {
    if (createdResult?.temporaryPassword) {
      await Clipboard.setStringAsync(createdResult.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBack = () => {
    if (createdResult) { nav.goBack(); return; }
    if (step === 1) { nav.goBack(); return; }
    setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Registrar Miembro"
        onBack={handleBack}
        rightIcon={<Text style={styles.stepText}>PASO {step} DE 3</Text>}
        backgroundColor={colors.backgroundForm}
      />

      <KeyboardScreen contentContainerStyle={styles.scrollContent}>
        {/* ── Step 1: Member data ── */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Informacion Personal</Text>
            <Text style={styles.description}>
              Complete los datos basicos para iniciar el proceso de membresia del nuevo atleta.
            </Text>

            {createMutation.error && <AlertBanner message={createMutation.error} variant="error" />}

            <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
              <Input label="NOMBRE COMPLETO" placeholder="Ej. Juan Perez" value={value} onChangeText={onChange} error={errors.name?.message} variant="dark" />
            )} />
            <Controller control={control} name="cedula" render={({ field: { onChange, value } }) => (
              <Input label="CEDULA" placeholder="12345678" value={value} onChangeText={onChange} error={errors.cedula?.message} variant="dark" keyboardType="numeric" maxLength={8} />
            )} />
            <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
              <Input label="TELEFONO" placeholder="584141771490" value={value} onChangeText={onChange} error={errors.phone?.message} variant="dark" keyboardType="phone-pad" maxLength={13} />
            )} />
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <Input label="EMAIL" placeholder="usuario@taurus.com" value={value} onChangeText={onChange} error={errors.email?.message} variant="dark" keyboardType="email-address" autoCapitalize="none" />
            )} />
            <GradientButton title="Siguiente  →" onPress={handleSubmit(handleStep1Next)} />
          </>
        )}

        {/* ── Step 2: Select plan ── */}
        {step === 2 && (
          <>
            <Text style={styles.title}>Seleccionar Plan</Text>
            <Text style={styles.description}>
              Seleccione un plan inicial para el miembro (opcional).
            </Text>

            {plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlanId(plan.id)}
                  style={[styles.planOption, isSelected && styles.planOptionSelected]}
                >
                  <View style={styles.planOptionLeft}>
                    <Text style={styles.planOptionIcon}>📅</Text>
                    <View style={styles.planOptionInfo}>
                      <Text style={styles.planOptionName}>{plan.name}</Text>
                      <Text style={styles.planOptionDays}>{plan.durationDays} DIAS DE ACCESO</Text>
                    </View>
                  </View>
                  <Text style={styles.planOptionPrice}>${plan.referencePrice}</Text>
                </Pressable>
              );
            })}

            <GradientButton
              title="Siguiente  →"
              onPress={handleStep2Next}
              disabled={!selectedPlanId}
            />

            <Pressable onPress={handleStep2Skip} style={styles.skipLink}>
              <Text style={styles.skipLinkText}>OMITIR — sin plan por ahora</Text>
            </Pressable>
          </>
        )}

        {/* ── Step 3: Confirmation (pre-submit) ── */}
        {step === 3 && !createdResult && (
          <>
            <Text style={styles.title}>Confirmar Registro</Text>
            <Text style={styles.description}>
              Revise los datos antes de confirmar.
            </Text>

            {createMutation.error && <AlertBanner message={createMutation.error} variant="error" />}

            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nombre</Text>
                <Text style={styles.summaryValue}>{formData?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cedula</Text>
                <Text style={styles.summaryValue}>{formData?.cedula}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Email</Text>
                <Text style={styles.summaryValue}>{formData?.email}</Text>
              </View>
              {formData?.phone ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Telefono</Text>
                  <Text style={styles.summaryValue}>{formData.phone}</Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Plan inicial</Text>
                <Text style={styles.summaryValue}>
                  {selectedPlan ? selectedPlan.name : 'Sin plan'}
                </Text>
              </View>
            </Card>

            <GradientButton
              title="CONFIRMAR REGISTRO  ✓"
              onPress={handleConfirm}
              loading={createMutation.loading}
            />
          </>
        )}

        {/* ── Step 3: Success (post-submit) ── */}
        {step === 3 && createdResult && (
          <>
            <View style={styles.successIcon}>
              <Check size={40} color={colors.white} />
            </View>
            <Text style={styles.successTitle}>Miembro registrado</Text>
            <Text style={styles.successDescription}>
              {createdResult.name} ha sido registrado exitosamente.
            </Text>

            {planError && <AlertBanner message={planError} variant="warning" />}

            {createdResult.temporaryPassword && (
              <Card style={styles.passwordCard}>
                <Text style={styles.passwordLabel}>CONTRASEÑA TEMPORAL</Text>
                <Text style={styles.passwordValue}>{createdResult.temporaryPassword}</Text>
                <Pressable style={styles.copyBtn} onPress={handleCopy}>
                  {copied ? (
                    <Check size={16} color={colors.sensorActive} />
                  ) : (
                    <Copy size={16} color={colors.primaryRed} />
                  )}
                  <Text style={[styles.copyBtnText, copied && { color: colors.sensorActive }]}>
                    {copied ? 'Copiada' : 'Copiar contraseña'}
                  </Text>
                </Pressable>
                <Text style={styles.passwordWarning}>
                  Esta contraseña no se podra ver de nuevo. Asegurese de compartirla con el miembro.
                </Text>
              </Card>
            )}

            <GradientButton title="LISTO" onPress={() => nav.goBack()} />
          </>
        )}

        {step === 1 && (
          <Text style={styles.terms}>
            SUJETO A TERMINOS Y CONDICIONES DE TAURUS GYM ELITE
          </Text>
        )}
      </KeyboardScreen>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundForm },
  stepText: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1, color: colors.textMuted },
  scrollContent: { padding: spacing.xxl, gap: 8 },
  title: { fontFamily: typography.titleS.fontFamily, fontSize: typography.titleS.fontSize, color: colors.textPrimary, marginBottom: 4 },
  description: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
  terms: { fontFamily: typography.labelS.fontFamily, fontSize: 8, letterSpacing: 1, color: colors.textPrimaryAlpha40, textAlign: 'center', marginTop: 16 },

  // Step 2 — Plan selection
  planOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.divider, marginBottom: 8 },
  planOptionSelected: { borderWidth: 2, borderColor: colors.primaryRed },
  planOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planOptionIcon: { fontSize: 18 },
  planOptionInfo: { gap: 2 },
  planOptionName: { fontFamily: typography.bodyM.fontFamily, fontSize: typography.bodyM.fontSize, color: colors.textPrimary },
  planOptionDays: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 0.5, color: colors.textMuted },
  planOptionPrice: { fontFamily: typography.headingM.fontFamily, fontSize: typography.headingM.fontSize, color: colors.textPrimary },
  skipLink: { alignItems: 'center', paddingVertical: 12 },
  skipLinkText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textMuted, letterSpacing: 0.5 },

  // Step 3 — Summary
  summaryCard: { padding: 20, gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted },
  summaryValue: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary, maxWidth: '60%', textAlign: 'right' },

  // Step 3 — Success
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.sensorActive, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 16 },
  successTitle: { fontFamily: typography.headingL.fontFamily, fontSize: typography.headingL.fontSize, color: colors.textPrimary, textAlign: 'center', marginTop: 12 },
  successDescription: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, textAlign: 'center' },

  // Password card
  passwordCard: { padding: 20, gap: 12, borderWidth: 2, borderColor: colors.primaryRed, alignItems: 'center' },
  passwordLabel: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1.5, color: colors.primaryRed },
  passwordValue: { fontFamily: typography.headingL.fontFamily, fontSize: 20, color: colors.textPrimary, letterSpacing: 1, textAlign: 'center' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.divider },
  copyBtnText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.primaryRed },
  passwordWarning: { fontFamily: typography.bodyXS.fontFamily, fontSize: 10, color: colors.badgeExpired, textAlign: 'center', lineHeight: 14 },
});
