import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '@components/ScreenHeader';
import { GradientButton } from '@components/GradientButton';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { Card } from '@components/Card';
import { Avatar } from '@components/Avatar';
import { Badge } from '@components/Badge';
import { AlertBanner } from '@components/AlertBanner';
import { useRenew } from '../hooks/useRenew';
import { useMemberDetail } from '../hooks/useMemberDetail';
import { useGreeting } from '@hooks/useGreeting';
import { useToast } from '@hooks/useToast';
import { usePlans } from '@features/plans/hooks/usePlans';
import { addDays, formatDateSpanish, formatDateShort } from '@utils/dates';
import { colors, typography, spacing } from '@theme/index';
import type { RenewMembershipScreenProps } from '@navigation/types';

const SUGGESTED_INDEX = 1;

export default function RenewMembershipScreen({ route }: RenewMembershipScreenProps) {
  const { memberId } = route.params;
  const nav = useNavigation();
  const { displayName } = useGreeting();
  const { mutate, loading, error } = useRenew();
  const { toast } = useToast();
  const memberQuery = useMemberDetail(memberId);
  const plansQuery = usePlans();
  const [selectedIndex, setSelectedIndex] = useState(SUGGESTED_INDEX);

  const member = memberQuery.data;
  const plans = plansQuery.data ?? [];
  const selectedPlan = plans[selectedIndex];

  const newExpiryDate = useMemo(() => {
    if (!selectedPlan) return '';
    const now = new Date();
    if (
      member?.subscriptionStatus === 'active' &&
      member?.currentExpiresAt &&
      new Date(member.currentExpiresAt) > now
    ) {
      return formatDateSpanish(addDays(member.currentExpiresAt, selectedPlan.durationDays));
    }
    return formatDateSpanish(addDays(now.toISOString(), selectedPlan.durationDays));
  }, [selectedPlan, member]);

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    await mutate({ memberId, planId: selectedPlan.id });
    toast.success(
      newExpiryDate
        ? `Membresia renovada hasta ${newExpiryDate}`
        : 'Membresia renovada',
    );
    nav.goBack();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={`Hola, ${displayName}`} onBack={() => nav.goBack()} rightIcon={<Text style={styles.icon}>⚙</Text>} />

      <KeyboardScreen contentContainerStyle={styles.scrollContent} dismissOnTap={false}>
        <Text style={styles.title}>RENOVAR{'\n'}MEMBRESIA</Text>
        <Text style={styles.description}>Selecciona un nuevo plan para el usuario</Text>

        {member && (
          <Card style={styles.memberInfoCard}>
            <View style={styles.memberInfoRow}>
              <Avatar size={42} name={member.name} />
              <View style={styles.memberInfoText}>
                <Text style={styles.memberInfoName}>{member.name}</Text>
                <Badge
                  label={member.subscriptionStatus === 'active' ? 'ACTIVO' : member.subscriptionStatus === 'expired' ? 'VENCIDO' : 'SIN PLAN'}
                  variant={member.subscriptionStatus === 'active' ? 'active' : member.subscriptionStatus === 'expired' ? 'expired' : 'neutral'}
                  badgeStyle="pill"
                />
              </View>
            </View>
          </Card>
        )}

        {member?.subscriptionStatus === 'active' && member?.currentExpiresAt && (
          <AlertBanner
            message={`La nueva suscripcion comenzara al vencer la actual (${formatDateShort(member.currentExpiresAt)})`}
            variant="info"
          />
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {plans.map((plan, index) => {
          const isSelected = index === selectedIndex;
          const isSuggested = index === SUGGESTED_INDEX;
          return (
            <Pressable key={plan.id} onPress={() => setSelectedIndex(index)} style={[styles.planOption, isSelected && styles.planOptionSelected]}>
              <View style={styles.planOptionLeft}>
                <Text style={styles.planOptionIcon}>📅</Text>
                <View style={styles.planOptionInfo}>
                  <Text style={styles.planOptionName}>{plan.name}</Text>
                  <Text style={styles.planOptionDays}>{plan.durationDays} DIAS DE ACCESO</Text>
                </View>
              </View>
              <View style={styles.planOptionRight}>
                <Text style={styles.planOptionPrice}>${plan.referencePrice}</Text>
                {isSuggested && <Text style={styles.suggestedBadge}>SUGERIDO</Text>}
              </View>
            </Pressable>
          );
        })}

        {selectedPlan && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>NUEVA FECHA DE VENCIMIENTO</Text>
                <Text style={styles.summaryDate}>{newExpiryDate || 'Calculando...'}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.summaryLabel}>TOTAL A PAGAR</Text>
                <Text style={styles.summaryTotal}>${selectedPlan.referencePrice}.00</Text>
              </View>
            </View>
          </View>
        )}

        <GradientButton
          title="CONFIRMAR RENOVACION  ✓"
          onPress={handleConfirm}
          loading={loading}
          disabled={!selectedPlan}
        />
      </KeyboardScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  icon: { fontSize: 20, color: colors.textPrimaryAlpha50 },
  scrollContent: { padding: spacing.xxl, gap: 12 },
  title: { fontFamily: typography.titleL.fontFamily, fontSize: typography.titleL.fontSize, color: colors.textPrimary, lineHeight: 38 },
  description: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, marginBottom: 8 },
  error: { fontFamily: typography.bodySM.fontFamily, color: colors.badgeExpired },
  memberInfoCard: { padding: 16, marginBottom: 4 },
  memberInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberInfoText: { flex: 1, gap: 4 },
  memberInfoName: { fontFamily: typography.bodyM.fontFamily, fontSize: typography.bodyM.fontSize, color: colors.textPrimary },
  planOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.divider },
  planOptionSelected: { borderWidth: 2, borderColor: colors.primaryRed },
  planOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planOptionIcon: { fontSize: 18 },
  planOptionInfo: { gap: 2 },
  planOptionName: { fontFamily: typography.bodyM.fontFamily, fontSize: typography.bodyM.fontSize, color: colors.textPrimary },
  planOptionDays: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 0.5, color: colors.textMuted },
  planOptionRight: { alignItems: 'flex-end', gap: 4 },
  planOptionPrice: { fontFamily: typography.headingM.fontFamily, fontSize: typography.headingM.fontSize, color: colors.textPrimary },
  suggestedBadge: { fontFamily: typography.labelS.fontFamily, fontSize: 8, letterSpacing: 0.5, color: colors.primaryRed, backgroundColor: colors.badgeExpiredBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  summary: { backgroundColor: colors.backgroundCard, borderRadius: 16, padding: 20, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontFamily: typography.labelS.fontFamily, fontSize: 8, letterSpacing: 0.5, color: colors.textMuted },
  summaryDate: { fontFamily: typography.bodyM.fontFamily, fontSize: 16, color: colors.textPrimary, marginTop: 4 },
  summaryRight: { alignItems: 'flex-end' },
  summaryTotal: { fontFamily: typography.headingL.fontFamily, fontSize: typography.headingL.fontSize, color: colors.textPrimary, marginTop: 4 },
});
