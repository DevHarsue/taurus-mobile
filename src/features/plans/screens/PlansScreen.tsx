import React, { useCallback } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { Card } from '@components/Card';
import { GradientButton } from '@components/GradientButton';
import { FAB } from '@components/FAB';
import { QueryRenderer } from '@components/QueryRenderer';
import { usePlans } from '../hooks/usePlans';
import { useDeletePlan } from '../hooks/useDeletePlan';
import { colors, typography, spacing } from '@theme/index';
import type { Plan, PlanBase } from '@app-types/plan';
import type { PlansStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<PlansStackParamList>;

function PlanCard({ plan, highlighted, onEdit, onDelete }: { plan: Plan; highlighted: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card style={[styles.planCard, highlighted && styles.planCardDark]}>
      <Text style={[styles.planTier, highlighted && styles.textWhite60]}>{plan.tier || 'BASIC TIER'}</Text>
      <View style={styles.priceRow}>
        <Text style={[styles.priceDollar, highlighted && styles.textWhite]}>$</Text>
        <Text style={[styles.priceAmount, highlighted && styles.textWhite]}>{plan.referencePrice}</Text>
      </View>
      {plan.benefits?.map((b, i) => (
        <Text key={i} style={[styles.benefit, highlighted && styles.textWhite80]}>{b}</Text>
      ))}
      {highlighted ? (
        <GradientButton title="EDIT PLAN" onPress={onEdit} />
      ) : (
        <Pressable style={styles.editBtn} onPress={onEdit}>
          <Text style={styles.editBtnText}>EDIT PLAN</Text>
        </Pressable>
      )}
      <Pressable onPress={onDelete} style={styles.deleteBtn}>
        <Text style={[styles.deleteBtnText, highlighted && styles.textWhite60]}>Eliminar</Text>
      </Pressable>
    </Card>
  );
}

export default function PlansScreen() {
  const nav = useNavigation<Nav>();
  const query = usePlans();
  const { mutate: deletePlan } = useDeletePlan();

  useFocusEffect(
    useCallback(() => {
      query.refetch();
    }, [query.refetch])
  );

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Esta seguro que desea eliminar "${planName}"?`)) return;
      await deletePlan(planId);
      query.refetch();
    } else {
      const { Alert } = require('react-native');
      Alert.alert(
        'Eliminar plan',
        `Esta seguro que desea eliminar "${planName}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              await deletePlan(planId);
              query.refetch();
            },
          },
        ],
      );
    }
  };

  const toPlanBase = (plan: Plan): PlanBase => ({
    id: plan.id,
    name: plan.name,
    durationDays: plan.durationDays,
    referencePrice: plan.referencePrice,
    isActive: plan.isActive,
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name="Taurus" backgroundColor={colors.primaryRed} />
            <Text style={styles.greeting}>Hola, Taurus</Text>
          </View>
        }
        rightIcon={<Text style={styles.bellIcon}>🔔</Text>}
        backgroundColor={colors.backgroundCard}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Manage Plans.</Text>
        <Text style={styles.description}>Configura los planes del gimnasio, sus precios y caracteristicas.</Text>

        <QueryRenderer query={query} emptyTitle="Sin planes" isEmpty={(d) => d.length === 0}>
          {(plans) => (
            <View style={styles.plansList}>
              {plans.map((plan, i) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  highlighted={plan.isHighlighted ?? i === 1}
                  onEdit={() => nav.navigate('EditPlan', { plan: toPlanBase(plan) })}
                  onDelete={() => handleDeletePlan(plan.id, plan.name)}
                />
              ))}
            </View>
          )}
        </QueryRenderer>

        <View style={{ height: 120 }} />
      </ScrollView>

      <FAB onPress={() => nav.navigate('CreatePlan')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundCard },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary },
  bellIcon: { fontSize: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 8 },
  title: { fontFamily: typography.titleS.fontFamily, fontSize: typography.titleS.fontSize, color: colors.textPrimary },
  description: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
  plansList: { gap: 16 },
  planCard: { padding: 20, gap: 8 },
  planCardDark: { backgroundColor: colors.textPrimary },
  planTier: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1.5, color: colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  priceDollar: { fontFamily: typography.bodyS.fontFamily, fontSize: 14, color: colors.textPrimary, marginTop: 4 },
  priceAmount: { fontFamily: typography.statM.fontFamily, fontSize: typography.statM.fontSize, color: colors.textPrimary },
  benefit: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted },
  editBtn: { borderWidth: 1, borderColor: colors.divider, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  editBtnText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary, letterSpacing: 0.5 },
  deleteBtn: { alignItems: 'center', paddingVertical: 8 },
  deleteBtnText: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.badgeExpired },
  textWhite: { color: colors.white },
  textWhite60: { color: '#FFFFFF60' },
  textWhite80: { color: '#FFFFFF99' },
});
