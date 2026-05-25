import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Trophy,
  RefreshCw,
} from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { Card } from '@components/Card';
import { BarChart } from '@components/BarChart';
import { DonutChart, type IDonutSegment } from '@components/DonutChart';
import { useGreeting } from '@hooks/useGreeting';
import {
  useDashboardStatistics,
  useAccessStatistics,
} from '../hooks/useStatistics';
import { colors, typography, spacing } from '@theme/index';

const CHART_COLORS = [
  colors.primaryRed,
  '#E67E22',
  '#2A7A3A',
  '#3498DB',
  '#9B59B6',
  '#1ABC9C',
];

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('es-VE', { minimumFractionDigits: 0 })}`;
}

function GrowthIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null;
  const pct =
    previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;

  return (
    <View style={styles.growthRow}>
      {up ? (
        <TrendingUp size={12} color={colors.sensorActive} />
      ) : (
        <TrendingDown size={12} color={colors.badgeExpired} />
      )}
      <Text
        style={[styles.growthText, { color: up ? colors.sensorActive : colors.badgeExpired }]}
      >
        {up ? '+' : ''}
        {pct}% vs mes anterior
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { displayName } = useGreeting();
  const stats = useDashboardStatistics();
  const access = useAccessStatistics();
  const insets = useSafeAreaInsets();

  const loading = stats.loading || access.loading;
  const error = stats.error || access.error;

  const memberData = stats.data?.members;
  const subsData = stats.data?.subscriptions;
  const revenueData = stats.data?.revenue;
  const renewalData = stats.data?.renewals;
  const accessData = access.data;

  const hasData = !!(stats.data || access.data);
  const isInitial = loading && !hasData;
  const isRefreshing = loading && hasData;

  const handleRefresh = useCallback(() => {
    stats.refetch();
    access.refetch();
  }, [stats, access]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name={displayName} backgroundColor={colors.primaryRed} />
            <Text style={styles.greeting}>Hola, {displayName}</Text>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primaryRed]}
            tintColor={colors.primaryRed}
          />
        }
      >
        {isInitial && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryRed} />
            <Text style={styles.loadingText}>Cargando estadisticas...</Text>
          </View>
        )}

        {error && !isInitial && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {!isInitial && !error && (
          <>
            {/* ── KPI Cards Row ────────────────────────────────── */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCardDefault}>
                <View style={styles.statIconRow}>
                  <Users size={16} color={colors.primaryRed} />
                </View>
                <Text style={styles.statNumberRed}>
                  {memberData?.totalMembers ?? 0}
                </Text>
                <Text style={styles.statLabel}>MIEMBROS TOTALES</Text>
                {memberData && (
                  <GrowthIndicator
                    current={memberData.newMembersThisMonth}
                    previous={memberData.newMembersLastMonth}
                  />
                )}
              </Card>

              <Card style={[styles.statCardDefault, styles.statCardPrimary]}>
                <View style={styles.statIconRow}>
                  <UserCheck size={16} color={colors.white} />
                </View>
                <Text style={styles.statNumberWhite}>
                  {memberData?.activeMembers ?? 0}
                </Text>
                <Text style={styles.statLabelWhite}>ACTIVOS</Text>
              </Card>

              <Card style={styles.statCardDefault}>
                <View style={styles.statIconRow}>
                  <DollarSign size={16} color={colors.sensorActive} />
                </View>
                <Text style={styles.statNumberGreen}>
                  {formatCurrency(revenueData?.estimatedThisMonth ?? 0)}
                </Text>
                <Text style={styles.statLabel}>INGRESOS ESTE MES</Text>
                {revenueData && (
                  <GrowthIndicator
                    current={revenueData.estimatedThisMonth}
                    previous={revenueData.estimatedLastMonth}
                  />
                )}
              </Card>

              <Card style={styles.statCardDefault}>
                <View style={styles.statIconRow}>
                  <Clock size={16} color={colors.primaryRed} />
                </View>
                <Text style={styles.statNumberRed}>
                  {accessData?.overview.totalAccessToday ?? 0}
                </Text>
                <Text style={styles.statLabel}>ACCESOS HOY</Text>
              </Card>
            </View>

            {/* ── Alerts ───────────────────────────────────────── */}
            {(subsData?.expiringIn7Days ?? 0) > 0 && (
              <Card style={styles.alertCard}>
                <AlertTriangle size={16} color={colors.warning} />
                <Text style={styles.alertText}>
                  {subsData!.expiringIn7Days} suscripcion(es) vencen en los proximos 7 dias
                </Text>
              </Card>
            )}

            {(accessData?.overview.denialRate ?? 0) > 10 && (
              <Card style={styles.alertCardDanger}>
                <ShieldAlert size={16} color={colors.badgeExpired} />
                <Text style={styles.alertTextDanger}>
                  Tasa de denegacion alta: {accessData!.overview.denialRate.toFixed(1)}%
                </Text>
              </Card>
            )}

            {/* ── Hourly Distribution ──────────────────────────── */}
            {accessData?.hourly && accessData.hourly.length > 0 && (
              <Card style={styles.chartCard}>
                <Text style={styles.sectionTitle}>Distribucion por hora</Text>
                <BarChart
                  data={accessData.hourly.map((h) => ({
                    label: `${h.hour}h`,
                    value: h.count,
                  }))}
                  height={150}
                />
              </Card>
            )}

            {/* ── Plan Distribution (Donut) + Revenue (Bars) ─── */}
            <View style={styles.chartsRow}>
              {subsData?.planDistribution &&
                subsData.planDistribution.length > 0 && (
                  <Card style={styles.chartCardFull}>
                    <Text style={styles.sectionTitle}>
                      Distribucion por plan
                    </Text>
                    <DonutChart
                      data={subsData.planDistribution.map(
                        (p, i): IDonutSegment => ({
                          label: p.planName,
                          value: p.count,
                          color: CHART_COLORS[i % CHART_COLORS.length],
                        }),
                      )}
                    />
                  </Card>
                )}

              {revenueData?.revenueByPlan &&
                revenueData.revenueByPlan.length > 0 && (
                  <Card style={styles.chartCardFull}>
                    <Text style={styles.sectionTitle}>Ingresos por plan</Text>
                    <BarChart
                      data={revenueData.revenueByPlan.map((r) => ({
                        label: r.planName,
                        value: r.estimatedRevenue,
                      }))}
                      barColor="#2A7A3A"
                      height={120}
                    />
                  </Card>
                )}
            </View>

            {/* ── Daily Distribution ───────────────────────────── */}
            {accessData?.daily && accessData.daily.length > 0 && (
              <Card style={styles.chartCard}>
                <Text style={styles.sectionTitle}>
                  Asistencia por dia de semana
                </Text>
                <BarChart
                  data={accessData.daily.map((d) => ({
                    label: d.dayName.substring(0, 3),
                    value: d.count,
                  }))}
                  barColor={colors.primaryRed}
                  height={120}
                />
              </Card>
            )}

            {/* ── Subscriptions Summary ────────────────────────── */}
            {subsData && (
              <Card style={styles.chartCard}>
                <Text style={styles.sectionTitle}>Estado de suscripciones</Text>
                <View style={styles.subsRow}>
                  <View style={styles.subsItem}>
                    <Text style={[styles.subsValue, { color: colors.sensorActive }]}>
                      {subsData.totalActive}
                    </Text>
                    <Text style={styles.subsLabel}>Activas</Text>
                  </View>
                  <View style={styles.subsDivider} />
                  <View style={styles.subsItem}>
                    <Text style={[styles.subsValue, { color: colors.badgeExpired }]}>
                      {subsData.totalExpired}
                    </Text>
                    <Text style={styles.subsLabel}>Vencidas</Text>
                  </View>
                  <View style={styles.subsDivider} />
                  <View style={styles.subsItem}>
                    <Text style={[styles.subsValue, { color: colors.textMuted }]}>
                      {subsData.totalCancelled}
                    </Text>
                    <Text style={styles.subsLabel}>Canceladas</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* ── Renewals ─────────────────────────────────────── */}
            {renewalData && (
              <Card style={styles.chartCard}>
                <View style={styles.renewalHeader}>
                  <RefreshCw size={16} color={colors.primaryRed} />
                  <Text style={styles.sectionTitle}>Renovaciones</Text>
                </View>
                <View style={styles.subsRow}>
                  <View style={styles.subsItem}>
                    <Text style={[styles.subsValue, { color: colors.primaryRed }]}>
                      {renewalData.totalRenewals}
                    </Text>
                    <Text style={styles.subsLabel}>Total</Text>
                  </View>
                  <View style={styles.subsDivider} />
                  <View style={styles.subsItem}>
                    <Text style={[styles.subsValue, { color: colors.textPrimary }]}>
                      {renewalData.renewalsThisMonth}
                    </Text>
                    <Text style={styles.subsLabel}>Este mes</Text>
                  </View>
                  <View style={styles.subsDivider} />
                  <View style={styles.subsItem}>
                    <Text style={[styles.subsValue, { color: colors.textMuted }]}>
                      {renewalData.renewalsLastMonth}
                    </Text>
                    <Text style={styles.subsLabel}>Mes anterior</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* ── Access Overview ──────────────────────────────── */}
            {accessData?.overview && (
              <Card style={styles.chartCard}>
                <Text style={styles.sectionTitle}>Resumen de accesos</Text>
                <View style={styles.accessGrid}>
                  <View style={styles.accessItem}>
                    <Text style={styles.accessValue}>
                      {accessData.overview.totalAccessToday}
                    </Text>
                    <Text style={styles.accessLabel}>Hoy</Text>
                  </View>
                  <View style={styles.accessItem}>
                    <Text style={styles.accessValue}>
                      {accessData.overview.totalAccessThisWeek}
                    </Text>
                    <Text style={styles.accessLabel}>Esta semana</Text>
                  </View>
                  <View style={styles.accessItem}>
                    <Text style={styles.accessValue}>
                      {accessData.overview.totalAccessThisMonth}
                    </Text>
                    <Text style={styles.accessLabel}>Este mes</Text>
                  </View>
                  <View style={styles.accessItem}>
                    <Text
                      style={[
                        styles.accessValue,
                        accessData.overview.deniedToday > 0 && {
                          color: colors.badgeExpired,
                        },
                      ]}
                    >
                      {accessData.overview.deniedToday}
                    </Text>
                    <Text style={styles.accessLabel}>Denegados hoy</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* ── Top Members ──────────────────────────────────── */}
            {accessData?.topMembers && accessData.topMembers.length > 0 && (
              <Card style={styles.chartCard}>
                <View style={styles.renewalHeader}>
                  <Trophy size={16} color={colors.warning} />
                  <Text style={styles.sectionTitle}>Top asistencia (30 dias)</Text>
                </View>
                {accessData.topMembers.map((m, i) => (
                  <View key={m.memberId} style={styles.topMemberRow}>
                    <Text style={styles.topMemberRank}>#{i + 1}</Text>
                    <Avatar size={28} name={m.memberName} />
                    <Text style={styles.topMemberName} numberOfLines={1}>
                      {m.memberName}
                    </Text>
                    <Text style={styles.topMemberCount}>
                      {m.visitCount} visitas
                    </Text>
                  </View>
                ))}
              </Card>
            )}

            {/* ── Denials Breakdown ────────────────────────────── */}
            {accessData?.denials && accessData.denials.length > 0 && (
              <Card style={styles.chartCard}>
                <Text style={styles.sectionTitle}>Razones de denegacion</Text>
                {accessData.denials.map((d) => (
                  <View key={d.reason} style={styles.denialRow}>
                    <View
                      style={[
                        styles.denialDot,
                        {
                          backgroundColor:
                            d.reason === 'expired'
                              ? colors.warning
                              : colors.badgeExpired,
                        },
                      ]}
                    />
                    <Text style={styles.denialReason}>
                      {d.reason === 'expired'
                        ? 'Suscripcion vencida'
                        : d.reason === 'not_found'
                          ? 'Miembro no encontrado'
                          : d.reason}
                    </Text>
                    <Text style={styles.denialCount}>{d.count}</Text>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundCard },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: {
    fontFamily: typography.headingXS.fontFamily,
    fontSize: typography.headingXS.fontSize,
    color: colors.textPrimary,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 14 },

  // Loading / Error
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textMuted,
  },
  errorCard: {
    padding: spacing.lg,
    backgroundColor: colors.badgeExpiredBg,
  },
  errorText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.badgeExpired,
    textAlign: 'center',
  },

  // KPI Cards
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCardDefault: { width: '47%', padding: 14, gap: 4 },
  statCardPrimary: { backgroundColor: colors.primaryRed },
  statIconRow: { marginBottom: 4 },
  statNumberRed: {
    fontFamily: typography.statL.fontFamily,
    fontSize: 28,
    color: colors.primaryRed,
  },
  statNumberWhite: {
    fontFamily: typography.statL.fontFamily,
    fontSize: 28,
    color: colors.white,
  },
  statNumberGreen: {
    fontFamily: typography.statL.fontFamily,
    fontSize: 22,
    color: colors.sensorActive,
  },
  statLabel: {
    fontFamily: typography.labelS.fontFamily,
    fontSize: typography.labelS.fontSize,
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  statLabelWhite: {
    fontFamily: typography.labelS.fontFamily,
    fontSize: typography.labelS.fontSize,
    letterSpacing: 0.5,
    color: '#FFFFFF99',
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  growthText: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 10,
  },

  // Alerts
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  alertText: {
    flex: 1,
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: '#92400E',
  },
  alertCardDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.badgeExpiredBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.badgeExpired,
  },
  alertTextDanger: {
    flex: 1,
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.badgeExpired,
  },

  // Charts
  chartCard: { padding: spacing.lg, gap: 12 },
  chartCardFull: { padding: spacing.lg, gap: 12 },
  chartsRow: { gap: 14 },
  sectionTitle: {
    fontFamily: typography.headingXS.fontFamily,
    fontSize: typography.headingXS.fontSize,
    color: colors.textPrimary,
  },

  // Subscriptions summary
  subsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  subsItem: { alignItems: 'center', gap: 4 },
  subsValue: {
    fontFamily: typography.statM.fontFamily,
    fontSize: 22,
  },
  subsLabel: {
    fontFamily: typography.labelM.fontFamily,
    fontSize: typography.labelM.fontSize,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  subsDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.divider,
  },

  // Renewal header
  renewalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Access overview grid
  accessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  accessItem: {
    width: '46%',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: colors.backgroundCard,
    borderRadius: 10,
    gap: 4,
  },
  accessValue: {
    fontFamily: typography.statM.fontFamily,
    fontSize: 20,
    color: colors.textPrimary,
  },
  accessLabel: {
    fontFamily: typography.labelM.fontFamily,
    fontSize: typography.labelM.fontSize,
    color: colors.textMuted,
    letterSpacing: 1,
  },

  // Top members
  topMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  topMemberRank: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textMuted,
    width: 24,
  },
  topMemberName: {
    flex: 1,
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textPrimary,
  },
  topMemberCount: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: typography.bodyXS.fontSize,
    color: colors.textSecondary,
  },

  // Denials
  denialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  denialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  denialReason: {
    flex: 1,
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textPrimary,
  },
  denialCount: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textSecondary,
  },
});
