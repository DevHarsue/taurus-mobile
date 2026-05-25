import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Settings } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import type { MemberHistoryStackParamList } from '@navigation/types';
import { Avatar } from '@components/Avatar';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { EmptyState } from '@components/EmptyState';
import { useGreeting } from '@hooks/useGreeting';
import { useMySubscriptions } from '@hooks/useMySubscriptions';
import { useMyMemberDetail } from '@features/members/hooks/useMyMemberDetail';
import { usePlans } from '@features/plans/hooks/usePlans';
import { formatDateShort, calculateDurationDays, formatDuration } from '@utils/dates';
import { colors, typography, spacing } from '@theme/index';

interface RenewalItem {
  id: string;
  type: 'current' | 'renewal' | 'initial';
  planName: string;
  date: string;
  duration: string;
}

const TYPE_ICONS: Record<string, string> = {
  current: '♛',
  renewal: '↻',
  initial: '☆',
};

const TYPE_LABELS: Record<string, string> = {
  current: 'PLAN ACTUAL',
  renewal: 'RENOVACION',
  initial: 'MEMBRESIA INICIAL',
};

export default function RenewalHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { displayName } = useGreeting();
  const nav = useNavigation<NativeStackNavigationProp<MemberHistoryStackParamList>>();
  const { data: myMember } = useMyMemberDetail();
  const subsQuery = useMySubscriptions();
  const plansQuery = usePlans();

  const renewals = useMemo<RenewalItem[]>(() => {
    const subscriptions = subsQuery.data ?? [];
    const plans = plansQuery.data ?? [];
    const planNameMap = new Map(plans.map((p) => [p.id, p.name]));

    return subscriptions.map((sub, index) => {
      const isCurrent = index === 0;
      const isFirst = index === subscriptions.length - 1;
      const durationDays = calculateDurationDays(sub.startsAt, sub.expiresAt);

      const planName = sub.planId
        ? planNameMap.get(sub.planId) ?? `Plan #${sub.planId.slice(0, 6)}`
        : myMember?.currentPlanName ?? 'Plan actual';

      return {
        id: sub.id,
        type: isCurrent ? 'current' : isFirst ? 'initial' : 'renewal',
        planName,
        date: formatDateShort(sub.startsAt),
        duration: formatDuration(durationDays),
      };
    });
  }, [subsQuery.data, plansQuery.data]);

  const isLoading = subsQuery.loading || plansQuery.loading;

  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name={displayName} backgroundColor={colors.primaryRed} />
            <Text style={styles.headerTitle}>Hola, {displayName}</Text>
          </View>
        }
        rightIcon={<Settings size={20} color={colors.textPrimary} strokeWidth={2} />}
        onRightPress={() => nav.navigate('Settings')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>MI HISTORIAL</Text>
        <Text style={styles.title}>HISTORIAL DE{'\n'}RENOVACIONES</Text>

        {isLoading ? (
          <LoadingSpinner />
        ) : renewals.length === 0 ? (
          <EmptyState
            title="Sin historial de renovaciones"
            description="Aun no tienes suscripciones registradas"
          />
        ) : (
          renewals.map((item, index) => (
            <View key={item.id}>
              <View style={styles.renewalRow}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{TYPE_ICONS[item.type]}</Text>
                </View>
                <View style={styles.renewalInfo}>
                  <Text style={styles.renewalLabel}>{TYPE_LABELS[item.type]}</Text>
                  <Text style={styles.renewalPlan}>{item.planName}</Text>
                  <Text style={styles.renewalDate}>{item.date}  ·  {item.duration}</Text>
                </View>
              </View>
              {index < renewals.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 8 },
  sectionLabel: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1.5, color: colors.textMuted },
  title: { fontFamily: typography.titleL.fontFamily, fontSize: typography.titleL.fontSize, color: colors.textPrimary, lineHeight: 38, marginBottom: 16 },
  renewalRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.backgroundCard, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  renewalInfo: { flex: 1, gap: 2 },
  renewalLabel: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1, color: colors.textMuted },
  renewalPlan: { fontFamily: typography.headingXS.fontFamily, fontSize: 15, color: colors.textPrimary },
  renewalDate: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.divider },
});
