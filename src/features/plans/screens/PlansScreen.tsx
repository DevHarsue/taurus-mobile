import React, { useCallback, useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Package } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { Card } from '@components/Card';
import { GradientButton } from '@components/GradientButton';
import { FAB } from '@components/FAB';
import { QueryRenderer } from '@components/QueryRenderer';
import { EmptyState } from '@components/EmptyState';
import { SkeletonCard, SkeletonList } from '@components/Skeleton';
import { useGreeting } from '@hooks/useGreeting';
import { useToast } from '@hooks/useToast';
import { useTheme } from '@hooks/useTheme';
import { confirmDialog } from '@utils/confirmDialog';
import { haptics } from '@utils/haptics';
import { usePlans } from '../hooks/usePlans';
import { useDeletePlan } from '../hooks/useDeletePlan';
import { typography, spacing, type Colors } from '@theme/index';
import type { Plan, PlanBase } from '@app-types/plan';
import type { PlansStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<PlansStackParamList>;

type Styles = ReturnType<typeof createStyles>;

function PlanCard({ plan, highlighted, onEdit, onDelete, styles }: { plan: Plan; highlighted: boolean; onEdit: () => void; onDelete: () => void; styles: Styles }) {
  return (
    <Card style={[styles.planCard, highlighted && styles.planCardDark]}>
      <Text style={[styles.planName, highlighted && styles.textWhite]}>{plan.name}</Text>
      <View style={styles.priceRow}>
        <Text style={[styles.priceDollar, highlighted && styles.textWhite]}>$</Text>
        <Text style={[styles.priceAmount, highlighted && styles.textWhite]}>{plan.referencePrice}</Text>
      </View>
      <Text style={[styles.planDuration, highlighted && styles.textWhite80]}>{plan.durationDays} dias de duracion</Text>
      {highlighted ? (
        <GradientButton title="EDITAR PLAN" onPress={onEdit} />
      ) : (
        <Pressable style={styles.editBtn} onPress={onEdit}>
          <Text style={styles.editBtnText}>EDITAR PLAN</Text>
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
  const { displayName } = useGreeting();
  const insets = useSafeAreaInsets();
  const query = usePlans();
  const { mutate: deletePlan } = useDeletePlan();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useFocusEffect(
    useCallback(() => {
      query.refetch();
    }, [query.refetch])
  );

  const handleDeletePlan = async (planId: string, planName: string) => {
    const ok = await confirmDialog(
      'Eliminar plan',
      `¿Seguro que deseas eliminar "${planName}"?`,
      { destructive: true, confirmLabel: 'Eliminar' },
    );
    if (!ok) return;
    await deletePlan(planId);
    query.refetch();
    toast.success('Plan eliminado');
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
            <Avatar size={32} name={displayName} backgroundColor={colors.primaryRed} />
            <Text style={styles.greeting}>Hola, {displayName}</Text>
          </View>
        }
        backgroundColor={colors.backgroundCard}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={query.loading}
            onRefresh={() => {
              haptics.light();
              query.refetch();
            }}
            tintColor={colors.primaryRed}
            colors={[colors.primaryRed]}
          />
        }
      >
        <Text style={styles.title}>Gestionar Planes.</Text>
        <Text style={styles.description}>Configura los planes del gimnasio, sus precios y caracteristicas.</Text>

        <QueryRenderer
          query={query}
          isEmpty={(d) => d.length === 0}
          skeleton={
            <SkeletonList count={3} renderItem={() => <SkeletonCard height={170} />} />
          }
          empty={
            <EmptyState
              icon={Package}
              title="No hay planes creados"
              description="Crea tu primer plan para empezar"
              actionLabel="Crear primer plan"
              onAction={() => nav.navigate('CreatePlan')}
            />
          }
        >
          {(plans) => (
            <View style={styles.plansList}>
              {plans.map((plan, i) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  highlighted={plan.isHighlighted ?? i === 1}
                  onEdit={() => nav.navigate('EditPlan', { plan: toPlanBase(plan) })}
                  onDelete={() => handleDeletePlan(plan.id, plan.name)}
                  styles={styles}
                />
              ))}
            </View>
          )}
        </QueryRenderer>
      </ScrollView>

      <FAB onPress={() => nav.navigate('CreatePlan')} />
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundCard },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 8 },
  title: { fontFamily: typography.titleS.fontFamily, fontSize: typography.titleS.fontSize, color: colors.textPrimary },
  description: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
  plansList: { gap: 16 },
  planCard: { padding: 20, gap: 8 },
  planCardDark: { backgroundColor: colors.textPrimary },
  planName: { fontFamily: typography.titleS.fontFamily, fontSize: typography.titleS.fontSize, color: colors.textPrimary },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  priceDollar: { fontFamily: typography.bodyS.fontFamily, fontSize: 14, color: colors.textPrimary, marginTop: 4 },
  priceAmount: { fontFamily: typography.statM.fontFamily, fontSize: typography.statM.fontSize, color: colors.textPrimary },
  planDuration: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted },
  editBtn: { borderWidth: 1, borderColor: colors.divider, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  editBtnText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary, letterSpacing: 0.5 },
  deleteBtn: { alignItems: 'center', paddingVertical: 8 },
  deleteBtnText: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.badgeExpired },
  textWhite: { color: colors.white },
  textWhite60: { color: '#FFFFFF60' },
  textWhite80: { color: '#FFFFFF99' },
});
