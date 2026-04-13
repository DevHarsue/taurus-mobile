import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@hooks/useAuth';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { colors, typography } from '@theme/index';

export default function MyQRScreen() {
  const { user } = useAuth();
  const qrValue = user?.id ?? 'taurus-member';

  return (
    <View style={styles.container}>
      <ScreenHeader
        backgroundColor={colors.backgroundDark}
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name="Taurus" backgroundColor={colors.primaryRed} />
            <Text style={styles.headerTitle}>Hola, Taurus</Text>
          </View>
        }
        rightIcon={<Text style={styles.headerIcon}>⚙</Text>}
      />

      <View style={styles.content}>
        <Text style={styles.accessLabel}>ACCESS IDENTITY</Text>
        <Text style={styles.title}>Digital Pass</Text>

        <View style={styles.qrWrapper}>
          <View style={styles.qrInner}>
            <QRCode value={qrValue} size={200} backgroundColor={colors.white} />
          </View>
        </View>

        <View style={styles.nameCard}>
          <Text style={styles.memberName}>{user?.email ?? 'Admin Taurus'}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>PREMIUM TIER</Text>
          </View>
        </View>

        <View style={styles.brightnessNote}>
          <Text style={styles.brightnessText}>☀ Screen brightness optimized for scanning</Text>
        </View>

        <Text style={styles.hint}>
          Muestra este codigo al administrador para renovar{'\n'}rapidamente
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.white },
  headerIcon: { fontSize: 20, color: '#FFFFFF60' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, gap: 20 },
  accessLabel: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 2, color: '#FFFFFF40' },
  title: { fontFamily: typography.titleM.fontFamily, fontSize: typography.titleM.fontSize, color: colors.white },
  qrWrapper: { padding: 16, borderRadius: 20, borderWidth: 3, borderColor: colors.qrBorder, backgroundColor: colors.white },
  qrInner: { borderRadius: 12, overflow: 'hidden' },
  nameCard: { backgroundColor: colors.textPrimary, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', gap: 8, width: '100%' },
  memberName: { fontFamily: typography.headingS.fontFamily, fontSize: typography.headingS.fontSize, color: colors.white },
  tierBadge: { backgroundColor: colors.primaryRed, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  tierText: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1, color: colors.white },
  brightnessNote: { backgroundColor: '#FFFFFF10', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, width: '100%', alignItems: 'center' },
  brightnessText: { fontFamily: typography.bodyXS.fontFamily, fontSize: typography.bodyXS.fontSize, color: '#FFFFFF60' },
  hint: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: '#FFFFFF30', textAlign: 'center', lineHeight: 20 },
});
