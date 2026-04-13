import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { colors, typography, spacing } from '@theme/index';

interface RenewalItem {
  id: string;
  type: 'current' | 'renewal' | 'initial';
  planName: string;
  date: string;
  duration: string;
}

const MOCK_RENEWALS: RenewalItem[] = [
  { id: '1', type: 'current', planName: 'Elite Performance Tier', date: 'Oct 12, 2023', duration: '12 Months Duration' },
  { id: '2', type: 'renewal', planName: 'Standard Strength', date: 'Oct 12, 2022', duration: '12 Months Duration' },
  { id: '3', type: 'renewal', planName: 'Standard Strength', date: 'Apr 12, 2022', duration: '6 Months Duration' },
  { id: '4', type: 'initial', planName: 'New Member Trial', date: 'Jan 12, 2022', duration: '3 Months Duration' },
];

const TYPE_ICONS: Record<string, string> = {
  current: '♛',
  renewal: '↻',
  initial: '☆',
};

const TYPE_LABELS: Record<string, string> = {
  current: 'CURRENT PLAN',
  renewal: 'RENEWAL',
  initial: 'INITIAL MEMBERSHIP',
};

export default function RenewalHistoryScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name="Taurus" backgroundColor={colors.primaryRed} />
            <Text style={styles.headerTitle}>Hola, Taurus</Text>
          </View>
        }
        rightIcon={<Text style={styles.headerIcon}>⚙</Text>}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>PREMIUM PERFORMANCE</Text>
        <Text style={styles.title}>RENEWAL{'\n'}HISTORY</Text>

        {MOCK_RENEWALS.map((item, index) => (
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
            {index < MOCK_RENEWALS.length - 1 && <View style={styles.divider} />}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.textPrimary },
  headerIcon: { fontSize: 20, color: colors.textPrimaryAlpha50 },
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
