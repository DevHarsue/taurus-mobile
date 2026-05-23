import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, Settings } from 'lucide-react-native';
import { useAuth } from '@hooks/useAuth';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { GradientButton } from '@components/GradientButton';
import { Card } from '@components/Card';
import { colors, typography, spacing } from '@theme/index';
import { useGreeting } from '@hooks/useGreeting';
import { useMyMemberDetail } from '@features/members/hooks/useMyMemberDetail';
import { useGenerateMemberCard } from '@features/members/hooks/useGenerateMemberCard';
import { useMyAccessLog } from '@hooks/useMyAccessLog';
import {
  formatDateSpanish,
  formatDateShort,
  formatMonthYear,
  getDaysInMonth,
  getFirstDayOfWeek,
} from '@utils/dates';

export default function MyProfileScreen() {
  const { user, logout } = useAuth();
  const { displayName } = useGreeting();
  const insets = useSafeAreaInsets();
  const { data: myMember } = useMyMemberDetail();
  const { mutate: generateCard, loading: generatingCard } = useGenerateMemberCard();
  const { data: accessLog } = useMyAccessLog();

  const membershipLabel =
    myMember?.subscriptionStatus === 'active'
      ? 'MEMBRESIA ACTIVA'
      : myMember?.subscriptionStatus === 'expired'
        ? 'MEMBRESIA VENCIDA'
        : 'SIN MEMBRESIA';

  const planName = myMember?.currentPlanName ?? 'Sin plan';

  const expiryText = myMember?.currentExpiresAt
    ? `Vence el ${formatDateSpanish(myMember.currentExpiresAt)}`
    : 'Sin fecha de vencimiento';

  const expiresDate = myMember?.currentExpiresAt
    ? new Date(myMember.currentExpiresAt)
    : null;

  const expiresDay = expiresDate?.getDate().toString() ?? '--';
  const expiresMonth = expiresDate
    ? new Intl.DateTimeFormat('es', { month: 'short' }).format(expiresDate).toUpperCase()
    : '---';

  const expiryShort = myMember?.currentExpiresAt
    ? formatDateShort(myMember.currentExpiresAt)
    : 'N/A';

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = formatMonthYear(now);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfWeek(year, month);

  const { attendedDays, totalVisits } = useMemo(() => {
    const days = new Set(
      (accessLog ?? [])
        .filter((item) => {
          const d = new Date(item.timestamp);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .map((item) => new Date(item.timestamp).getDate()),
    );
    return { attendedDays: days, totalVisits: days.size };
  }, [accessLog, month, year]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name={displayName} backgroundColor={colors.primaryRed} />
            <Text style={styles.greeting}>Hola, {displayName}</Text>
          </View>
        }
        rightIcon={<Settings size={20} color={colors.textPrimary} strokeWidth={2} />}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Membership Card */}
        <Card style={styles.membershipCard}>
          <Text style={styles.membershipLabel}>{membershipLabel}</Text>
          <Text style={styles.planName}>{planName}</Text>
          <Text style={styles.planExpiry}>{expiryText}</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateCircle}>
              <Text style={styles.dateNumber}>{expiresDay}</Text>
              <Text style={styles.dateMonth}>{expiresMonth}</Text>
            </View>
            <View style={styles.dateInfo}>
              <View style={styles.dateInfoRow}>
                <Text style={styles.dateLabel}>Dias restantes</Text>
                <Text style={styles.dateValue}>{myMember?.daysLeft ?? 0} dias</Text>
              </View>
              <View style={styles.dateInfoRow}>
                <Text style={styles.dateLabel}>Vencimiento</Text>
                <Text style={styles.dateValue}>{expiryShort}</Text>
              </View>
              <View style={styles.dateInfoRow}>
                <Text style={styles.dateLabel}>Estado</Text>
                <Text style={styles.dateValue}>
                  {myMember?.subscriptionStatus === 'active' ? 'Activa' : myMember?.subscriptionStatus === 'expired' ? 'Vencida' : 'Sin plan'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>DIAS RESTANTES</Text>
            <Text style={styles.statNumber}>{myMember?.daysLeft ?? 0}</Text>
            <Text style={styles.statUnit}>dias</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>VISITAS ESTE MES</Text>
            <Text style={styles.statNumber}>{totalVisits}</Text>
            <Text style={styles.statUnit}>visitas</Text>
          </Card>
        </View>

        {/* Attendance Calendar */}
        <Card style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Mi asistencia este mes</Text>
            <Text style={styles.calendarMonth}>{monthName}</Text>
          </View>
          <View style={styles.calendarGrid}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <Text key={i} style={styles.dayHeader}>{d}</Text>
            ))}
            {Array.from({ length: firstDayOffset }, (_, i) => (
              <Text key={`empty-${i}`} style={styles.dayNumber}>{' '}</Text>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const attended = attendedDays.has(day);
              return (
                <Text key={day} style={[styles.dayNumber, attended && styles.dayAttended]}>{day}</Text>
              );
            })}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Visitas</Text>
            <Text style={styles.totalNumber}>{totalVisits}</Text>
          </View>
        </Card>

        {myMember ? (
          <GradientButton
            title="Descargar mi carnet"
            onPress={() => {
              void generateCard(myMember).catch((e) => {
                const msg = e instanceof Error ? e.message : 'Error desconocido';
                if (Platform.OS === 'web') {
                  window.alert(`No se pudo generar el carnet:\n${msg}`);
                } else {
                  const { Alert } = require('react-native');
                  Alert.alert('No se pudo generar el carnet', msg);
                }
              });
            }}
            loading={generatingCard}
          />
        ) : null}

        <Pressable
          style={styles.logoutBtn}
          onPress={() => {
            const confirmAndLogout = () => {
              void logout();
            };
            if (Platform.OS === 'web') {
              if (window.confirm('¿Cerrar sesión?')) confirmAndLogout();
            } else {
              const { Alert } = require('react-native');
              Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', style: 'destructive', onPress: confirmAndLogout },
              ]);
            }
          }}
        >
          <LogOut size={18} color={colors.badgeExpired} strokeWidth={2} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        {user?.email ? (
          <Text style={styles.emailHint}>{user.email}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundCard },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 16 },
  membershipCard: { padding: 20, gap: 4 },
  membershipLabel: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1.5, color: colors.primaryRed },
  planName: { fontFamily: typography.headingL.fontFamily, fontSize: typography.headingL.fontSize, color: colors.textPrimary },
  planExpiry: { fontFamily: typography.bodyXS.fontFamily, fontSize: typography.bodyXS.fontSize, color: colors.textMuted, marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  dateCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.primaryRed, alignItems: 'center', justifyContent: 'center' },
  dateNumber: { fontFamily: typography.headingM.fontFamily, fontSize: typography.headingM.fontSize, color: colors.primaryRed },
  dateMonth: { fontFamily: typography.labelM.fontFamily, fontSize: 9, color: colors.textMuted },
  dateInfo: { gap: 4 },
  dateInfoRow: { flexDirection: 'row', gap: 12 },
  dateLabel: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted, width: 80 },
  dateValue: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textPrimary },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 16 },
  statLabel: { fontFamily: typography.labelS.fontFamily, fontSize: typography.labelS.fontSize, letterSpacing: 1, color: colors.textMuted },
  statNumber: { fontFamily: typography.statL.fontFamily, fontSize: typography.statL.fontSize, color: colors.primaryRed },
  statUnit: { fontFamily: typography.bodyXS.fontFamily, fontSize: typography.bodyXS.fontSize, color: colors.textMuted },
  calendarCard: { padding: 16, gap: 12 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calendarTitle: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
  calendarMonth: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1.5, color: colors.primaryRed },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayHeader: { width: '14.28%', textAlign: 'center', fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textPrimaryAlpha40, marginBottom: 8 },
  dayNumber: { width: '14.28%', textAlign: 'center', fontFamily: typography.bodyXS.fontFamily, fontSize: 13, color: colors.textPrimary, paddingVertical: 6 },
  dayAttended: { fontFamily: typography.bodyS.fontFamily, color: colors.primaryRed },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.textPrimaryAlpha10 },
  totalLabel: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted },
  totalNumber: { fontFamily: typography.headingM.fontFamily, fontSize: typography.headingM.fontSize, color: colors.primaryRed },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 16 },
  logoutText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.badgeExpired, fontWeight: '600' },
  emailHint: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: -8 },
});
