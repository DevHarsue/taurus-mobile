import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { Card } from '@components/Card';
import { useDashboard } from '../hooks/useDashboard';
import { colors, typography, spacing } from '@theme/index';

export default function DashboardScreen() {
  const { data, loading } = useDashboard();

  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name="Carlos" backgroundColor={colors.primaryRed} />
            <Text style={styles.greeting}>Hola, Carlos</Text>
          </View>
        }
        rightIcon={<Text style={styles.bellIcon}>🔔</Text>}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Sensor Status */}
        <View style={styles.sensorRow}>
          <View style={styles.sensorDot} />
          <Text style={styles.sensorText}>SENSOR ACTIVO</Text>
          <Text style={styles.sensorId}>ESP32-GATE-01</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCardDefault}>
            <Text style={styles.statNumberRed}>42</Text>
            <Text style={styles.statLabel}>ENTRADAS HOY</Text>
            <Text style={styles.statDelta}>+12% VS LAST WEEK</Text>
          </Card>
          <Card style={[styles.statCardDefault, styles.statCardPrimary]}>
            <Text style={styles.statNumberWhite}>256</Text>
            <Text style={styles.statLabelWhite}>MIEMBROS ACTIVOS</Text>
          </Card>
          <Card style={styles.statCardDefault}>
            <Text style={styles.statNumberWarning}>8</Text>
            <Text style={styles.statLabel}>VENCEN ESTA SEMANA</Text>
          </Card>
          <Card style={styles.statCardDefault}>
            <Text style={styles.statNumberDanger}>15</Text>
            <Text style={styles.statLabel}>VENCIDOS</Text>
          </Card>
        </View>

        {/* Recent Access */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accesos recientes</Text>
          <Text style={styles.seeAll}>VER TODOS</Text>
        </View>

        {data?.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.accessRow}>
            <Avatar size={36} name={item.memberName} />
            <View style={styles.accessInfo}>
              <Text style={styles.accessName}>{item.memberName}</Text>
              <Text style={styles.accessTime}>{item.reason} · {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
        ))}

        {!data && !loading && (
          <Text style={styles.emptyText}>Sin accesos recientes</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundCard },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary },
  bellIcon: { fontSize: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 16 },
  sensorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sensorDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sensorActive },
  sensorText: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1, color: colors.sensorActive },
  sensorId: { fontFamily: typography.bodyXS.fontFamily, fontSize: typography.bodyXS.fontSize, color: colors.textMuted },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCardDefault: { width: '47%', padding: 16, gap: 4 },
  statCardPrimary: { backgroundColor: colors.primaryRed },
  statNumberRed: { fontFamily: typography.statL.fontFamily, fontSize: typography.statL.fontSize, color: colors.primaryRed },
  statNumberWhite: { fontFamily: typography.statL.fontFamily, fontSize: typography.statL.fontSize, color: colors.white },
  statNumberWarning: { fontFamily: typography.statL.fontFamily, fontSize: typography.statL.fontSize, color: colors.warning },
  statNumberDanger: { fontFamily: typography.statL.fontFamily, fontSize: typography.statL.fontSize, color: colors.badgeExpired },
  statLabel: { fontFamily: typography.labelS.fontFamily, fontSize: typography.labelS.fontSize, letterSpacing: 0.5, color: colors.textMuted },
  statLabelWhite: { fontFamily: typography.labelS.fontFamily, fontSize: typography.labelS.fontSize, letterSpacing: 0.5, color: '#FFFFFF99' },
  statDelta: { fontFamily: typography.bodyXS.fontFamily, fontSize: 10, color: colors.sensorActive },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionTitle: { fontFamily: typography.bodyM.fontFamily, fontSize: typography.bodyM.fontSize, color: colors.textPrimary },
  seeAll: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1, color: colors.primaryRed },
  accessRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  accessInfo: { flex: 1, gap: 2 },
  accessName: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
  accessTime: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted },
  emptyText: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
});
