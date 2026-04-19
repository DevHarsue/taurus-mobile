import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '@components/ScreenHeader';
import { Badge } from '@components/Badge';
import { Card } from '@components/Card';
import { CircularProgress } from '@components/CircularProgress';
import { GradientButton } from '@components/GradientButton';
import { QueryRenderer } from '@components/QueryRenderer';
import { useMemberDetail } from '../hooks/useMemberDetail';
import { useMemberSubscriptions } from '../hooks/useMemberSubscriptions';
import { colors, typography, spacing } from '@theme/index';
import type { MemberDetailScreenProps, MembersStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<MembersStackParamList>;

export default function MemberDetailScreen({ route }: MemberDetailScreenProps) {
  const { id } = route.params;
  const nav = useNavigation<Nav>();
  const query = useMemberDetail(id);
  const subscriptionsQuery = useMemberSubscriptions(id);

  useFocusEffect(
    useCallback(() => {
      query.refetch();
      subscriptionsQuery.refetch();
    }, [query.refetch, subscriptionsQuery.refetch])
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Expediente"
        onBack={() => nav.goBack()}
        rightIcon={<Text style={styles.infoIcon}>ⓘ</Text>}
      />

      <QueryRenderer query={query} emptyTitle="Miembro no encontrado">
        {(member) => {
          const totalDays = 30;
          const progress = Math.max(0, member.daysLeft / totalDays);
          return (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <View style={styles.statusRow}>
                <Badge
                  label={member.subscriptionStatus === 'active' ? 'ACTIVO' : member.subscriptionStatus === 'expired' ? 'VENCIDO' : 'SIN PLAN'}
                  variant={member.subscriptionStatus === 'active' ? 'active' : member.subscriptionStatus === 'expired' ? 'expired' : 'neutral'}
                  badgeStyle="dot"
                />
                <Text style={styles.memberId}>ID: {member.cedula}</Text>
              </View>

              <Text style={styles.memberName}>{member.name.toUpperCase()}</Text>

              <View style={styles.progressContainer}>
                <CircularProgress
                  size={140}
                  strokeWidth={6}
                  progress={progress}
                  color={colors.primaryRed}
                  backgroundColor={colors.divider}
                >
                  <Text style={styles.daysNumber}>{member.daysLeft}</Text>
                  <Text style={styles.daysLabel}>DIAS RESTANTES</Text>
                </CircularProgress>
              </View>

              <Card style={styles.planCard}>
                <Text style={styles.planIcon}>📋</Text>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>Membresia</Text>
                  <Text style={styles.planDateLabel}>{member.daysLeft} dias restantes</Text>
                </View>
              </Card>

              <Text style={styles.historyTitle}>HISTORIAL DE SUSCRIPCIONES</Text>

              {subscriptionsQuery.data?.length ? (
                subscriptionsQuery.data.map((sub) => (
                  <View key={sub.id} style={styles.historyRow}>
                    <Text style={styles.historyIcon}>{sub.status === 'active' ? '✓' : '↻'}</Text>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>Suscripcion ({sub.status})</Text>
                      <Text style={styles.historyMeta}>Inicio: {new Date(sub.startsAt).toLocaleDateString('es')}</Text>
                    </View>
                    <Text style={styles.historyDate}>{new Date(sub.expiresAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyHistory}>Sin suscripciones registradas</Text>
              )}

              <GradientButton
                title="+ Renovar membresia"
                onPress={() => nav.navigate('RenewMembership', { memberId: id, memberName: member.name })}
              />

              <View style={{ height: 40 }} />
            </ScrollView>
          );
        }}
      </QueryRenderer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  infoIcon: { fontSize: 20, color: colors.textPrimaryAlpha50 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xxl, gap: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberId: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted },
  memberName: { fontFamily: typography.titleM.fontFamily, fontSize: typography.titleM.fontSize, color: colors.textPrimary, lineHeight: 36, marginTop: 4 },
  memberSince: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, marginBottom: 16 },
  progressContainer: { alignItems: 'center', paddingVertical: 16 },
  daysNumber: { fontFamily: typography.statXL.fontFamily, fontSize: typography.statXL.fontSize, color: colors.primaryRed },
  daysLabel: { fontFamily: typography.labelS.fontFamily, fontSize: 8, letterSpacing: 1, color: colors.textMuted },
  planCard: { flexDirection: 'row', gap: 12, padding: 16, alignItems: 'flex-start' },
  planIcon: { fontSize: 20 },
  planInfo: { flex: 1, gap: 8 },
  planName: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
  planDates: { flexDirection: 'row', justifyContent: 'space-between' },
  planDateLabel: { fontFamily: typography.labelS.fontFamily, fontSize: 8, letterSpacing: 0.5, color: colors.textMuted },
  planDateValue: { fontFamily: typography.bodyS.fontFamily, fontSize: 13, color: colors.textPrimary },
  historyTitle: { fontFamily: typography.labelL.fontFamily, fontSize: typography.labelL.fontSize, letterSpacing: 1.5, color: colors.textMuted, marginTop: 16 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  historyIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  historyInfo: { flex: 1, gap: 2 },
  historyName: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
  historyMeta: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted },
  historyDate: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted },
  emptyHistory: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
});
