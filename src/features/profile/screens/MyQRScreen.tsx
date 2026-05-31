import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';
import { useGreeting } from '@hooks/useGreeting';
import type { MemberQRStackParamList } from '@navigation/types';
import { ScreenHeader } from '@components/ScreenHeader';
import { Avatar } from '@components/Avatar';
import { colors, typography } from '@theme/index';
import { useMyMemberDetail } from '@features/members/hooks/useMyMemberDetail';
import { buildMemberQrPayload } from '@features/members/utils/memberQr';

export default function MyQRScreen() {
  const { user } = useAuth();
  const { displayName } = useGreeting();
  const nav = useNavigation<NativeStackNavigationProp<MemberQRStackParamList>>();
  const insets = useSafeAreaInsets();
  const { data: myMember } = useMyMemberDetail();
  const qrValue = myMember ? buildMemberQrPayload(myMember.id) : '';

  return (
    <View style={styles.container}>
      <ScreenHeader
        backgroundColor={colors.backgroundDark}
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name={displayName} backgroundColor={colors.primaryRed} />
            <Text style={styles.headerTitle}>Hola, {displayName}</Text>
          </View>
        }
        rightIcon={<Settings size={20} color="#FFFFFF99" strokeWidth={2} />}
        onRightPress={() => nav.navigate('Settings')}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.accessLabel}>IDENTIDAD DE ACCESO</Text>
        <Text style={styles.title}>Pase Digital</Text>

        <View style={styles.qrWrapper}>
          <View style={styles.qrInner}>
            {qrValue ? (
              <QRCode value={qrValue} size={200} backgroundColor={colors.white} />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>Cargando…</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.nameCard}>
          <Text style={styles.memberName}>{displayName}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{myMember?.currentPlanName?.toUpperCase() ?? 'MIEMBRO'}</Text>
          </View>
        </View>

        <View style={styles.brightnessNote}>
          <Text style={styles.brightnessText}>☀ Brillo de pantalla optimizado para escanear</Text>
        </View>

        <Text style={styles.hint}>
          Muestra este codigo al administrador para renovar{'\n'}rapidamente
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: typography.headingXS.fontFamily, fontSize: typography.headingXS.fontSize, color: colors.white },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, gap: 20 },
  accessLabel: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 2, color: '#FFFFFF40' },
  title: { fontFamily: typography.titleM.fontFamily, fontSize: typography.titleM.fontSize, color: colors.white },
  qrWrapper: { padding: 16, borderRadius: 20, borderWidth: 3, borderColor: colors.qrBorder, backgroundColor: colors.white },
  qrInner: { borderRadius: 12, overflow: 'hidden' },
  qrPlaceholder: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F4F5' },
  qrPlaceholderText: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted },
  nameCard: { backgroundColor: colors.textPrimary, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', gap: 8, width: '100%' },
  memberName: { fontFamily: typography.headingS.fontFamily, fontSize: typography.headingS.fontSize, color: colors.white },
  tierBadge: { backgroundColor: colors.primaryRed, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  tierText: { fontFamily: typography.labelM.fontFamily, fontSize: typography.labelM.fontSize, letterSpacing: 1, color: colors.white },
  brightnessNote: { backgroundColor: '#FFFFFF10', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, width: '100%', alignItems: 'center' },
  brightnessText: { fontFamily: typography.bodyXS.fontFamily, fontSize: typography.bodyXS.fontSize, color: '#FFFFFF60' },
  hint: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: '#FFFFFF30', textAlign: 'center', lineHeight: 20 },
});
