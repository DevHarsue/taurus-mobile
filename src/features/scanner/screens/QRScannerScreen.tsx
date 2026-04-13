import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { colors, typography, spacing } from '@theme/index';

export default function QRScannerScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Scanner QR"
        onBack={() => {}}
        backgroundColor={colors.black}
        rightIcon={<Text style={styles.flashIcon}>⚡</Text>}
      />

      <View style={styles.content}>
        <Text style={styles.instruction}>APUNTA LA CAMARA AL QR DEL MIEMBRO</Text>

        <View style={styles.viewfinder}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          <Text style={styles.scanPlaceholder}>Camera Preview</Text>
        </View>

        <Text style={styles.hint}>
          Escanea el codigo QR del miembro para registrar su{'\n'}acceso al gimnasio
        </Text>

        <Pressable style={styles.manualBtn}>
          <Text style={styles.manualBtnText}>⌨ Ingresar codigo manual</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  flashIcon: { fontSize: 20, color: colors.white },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: 24 },
  instruction: { fontFamily: typography.labelL.fontFamily, fontSize: typography.labelL.fontSize, letterSpacing: 2, color: '#FFFFFF60', textAlign: 'center' },
  viewfinder: { width: 280, height: 280, borderRadius: 24, borderWidth: 3, borderColor: colors.primaryRed, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: colors.white },
  cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },
  scanPlaceholder: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: '#FFFFFF30' },
  hint: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: '#FFFFFF40', textAlign: 'center', lineHeight: 20 },
  manualBtn: { backgroundColor: '#FFFFFF10', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, width: '100%', alignItems: 'center' },
  manualBtnText: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: '#FFFFFF60' },
});
