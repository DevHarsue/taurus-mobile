import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@hooks/useAuth';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { GradientButton } from '@components/GradientButton';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { colors, typography, spacing } from '@theme/index';

export default function MyProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name="Taurus" backgroundColor={colors.primaryRed} />
            <Text style={styles.greeting}>Hola, Taurus</Text>
          </View>
        }
        rightIcon={<Text style={styles.headerIcon}>⚙</Text>}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Membership Card */}
        <Card style={styles.membershipCard}>
          <Text style={styles.membershipLabel}>MEMBRESIA ACTIVA</Text>
          <Text style={styles.planName}>Plan Black Elite</Text>
          <Text style={styles.planExpiry}>Vence el 15 de Octubre, 2024</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateCircle}>
              <Text style={styles.dateNumber}>24</Text>
              <Text style={styles.dateMonth}>OCT</Text>
            </View>
            <View style={styles.dateInfo}>
              <View style={styles.dateInfoRow}>
                <Text style={styles.dateLabel}>Inicio</Text>
                <Text style={styles.dateValue}>15 Sep 2023</Text>
              </View>
              <View style={styles.dateInfoRow}>
                <Text style={styles.dateLabel}>Renovacion</Text>
                <Text style={styles.dateValue}>15 Oct 2024</Text>
              </View>
              <View style={styles.dateInfoRow}>
                <Text style={styles.dateLabel}>Vencimiento</Text>
                <Text style={styles.dateValue}>15 Oct 2024</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>RACHA ACTUAL</Text>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statUnit}>dias</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>PROXIMO MES</Text>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statUnit}>visitas</Text>
          </Card>
        </View>

        {/* Attendance Calendar */}
        <Card style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Mi asistencia este mes</Text>
            <Text style={styles.calendarMonth}>SEPTIEMBRE</Text>
          </View>
          <View style={styles.calendarGrid}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <Text key={i} style={styles.dayHeader}>{d}</Text>
            ))}
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map((d) => {
              const attended = [4, 8, 9, 10].includes(d);
              return (
                <Text key={d} style={[styles.dayNumber, attended && styles.dayAttended]}>{d}</Text>
              );
            })}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Visitas</Text>
            <Text style={styles.totalNumber}>18</Text>
          </View>
        </Card>

        <GradientButton title="FINALIZAR ENTRENAMIENTO" onPress={() => {}} />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundCard },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary },
  headerIcon: { fontSize: 20, color: colors.textPrimaryAlpha50 },
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
});
