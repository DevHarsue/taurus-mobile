import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Zap, Keyboard as KeyboardIcon } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ScreenHeader } from '@components/ScreenHeader';
import { GradientButton } from '@components/GradientButton';
import { colors, typography, spacing } from '@theme/index';
import { membersService } from '@api/services';
import { parseMemberIdFromQr } from '@features/members/utils/memberQr';

type ScanState =
  | { type: 'idle' }
  | { type: 'looking-up'; memberId: string }
  | { type: 'error'; message: string };

export default function QRScannerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>({ type: 'idle' });
  const [manualOpen, setManualOpen] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const lockRef = useRef(false);

  const goToRenew = useCallback(
    async (memberId: string) => {
      if (lockRef.current) return;
      lockRef.current = true;
      setScanState({ type: 'looking-up', memberId });
      try {
        const member = await membersService.getById(memberId);
        navigation.getParent()?.navigate('Members', {
          screen: 'RenewMembership',
          params: { memberId: member.id, memberName: member.name },
        });
        // Unlock once we leave so a return to this screen works
        setTimeout(() => {
          lockRef.current = false;
          setScanState({ type: 'idle' });
        }, 800);
      } catch {
        lockRef.current = false;
        setScanState({
          type: 'error',
          message: 'No se encontró el miembro con ese QR.',
        });
      }
    },
    [navigation],
  );

  const handleBarcode = useCallback(
    ({ data }: { data: string }) => {
      if (lockRef.current) return;
      const id = parseMemberIdFromQr(data);
      if (!id) {
        lockRef.current = true;
        setScanState({
          type: 'error',
          message: 'Código QR no reconocido como carnet de Taurus.',
        });
        setTimeout(() => {
          lockRef.current = false;
          setScanState({ type: 'idle' });
        }, 2000);
        return;
      }
      void goToRenew(id);
    },
    [goToRenew],
  );

  const handleManualSubmit = useCallback(() => {
    const id = parseMemberIdFromQr(manualInput);
    if (!id) {
      setScanState({
        type: 'error',
        message: 'El código no es un UUID válido.',
      });
      return;
    }
    setManualOpen(false);
    setManualInput('');
    void goToRenew(id);
  }, [manualInput, goToRenew]);

  const isWeb = Platform.OS === 'web';
  const permissionGranted = permission?.granted ?? false;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Escanear QR"
        backgroundColor={colors.black}
        rightIcon={<Zap size={20} color={colors.white} strokeWidth={2} />}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>APUNTA LA CÁMARA AL QR DEL MIEMBRO</Text>

        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {isWeb ? (
            <Text style={styles.scanPlaceholder}>
              El escáner solo funciona en{'\n'}dispositivo móvil.
            </Text>
          ) : !permission ? (
            <ActivityIndicator color={colors.white} />
          ) : !permissionGranted ? (
            <View style={styles.permissionBox}>
              <Text style={styles.permissionText}>
                Necesitamos acceso a la cámara para escanear QR
              </Text>
              <Pressable style={styles.permissionBtn} onPress={() => void requestPermission()}>
                <Text style={styles.permissionBtnText}>Conceder permiso</Text>
              </Pressable>
            </View>
          ) : (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={
                scanState.type === 'looking-up' ? undefined : handleBarcode
              }
            />
          )}

          {scanState.type === 'looking-up' && (
            <View style={styles.overlayBox}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.overlayText}>Buscando miembro…</Text>
            </View>
          )}
        </View>

        {scanState.type === 'error' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{scanState.message}</Text>
          </View>
        )}

        <Text style={styles.hint}>
          Al detectar el QR, abrirá la pantalla de renovación{'\n'}con los datos del miembro.
        </Text>

        <Pressable style={styles.manualBtn} onPress={() => setManualOpen(true)}>
          <KeyboardIcon size={16} color="#FFFFFF80" strokeWidth={2} />
          <Text style={styles.manualBtnText}>Ingresar código manual</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={manualOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setManualOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Código del miembro</Text>
            <Text style={styles.modalSub}>
              Pega el UUID o la URL completa del carnet
            </Text>
            <TextInput
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="ej. 8f4a9c2b-3e1d-... o https://gymtaurus.com/verify/..."
              placeholderTextColor="#9ca3af"
              style={styles.modalInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => {
                  setManualOpen(false);
                  setManualInput('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <GradientButton title="Buscar" onPress={handleManualSubmit} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: 24,
    gap: 24,
  },
  instruction: {
    fontFamily: typography.labelL.fontFamily,
    fontSize: typography.labelL.fontSize,
    letterSpacing: 2,
    color: '#FFFFFF60',
    textAlign: 'center',
  },
  viewfinder: {
    width: 280,
    height: 280,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.primaryRed,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0a0000',
  },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: colors.white, zIndex: 5 },
  cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },
  scanPlaceholder: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: '#FFFFFF60',
    textAlign: 'center',
  },
  permissionBox: { padding: 16, alignItems: 'center', gap: 12 },
  permissionText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: '#FFFFFFCC',
    textAlign: 'center',
  },
  permissionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: colors.primaryRed,
    borderRadius: 999,
  },
  permissionBtnText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.white,
    fontWeight: '600',
  },
  overlayBox: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0a0000CC',
    zIndex: 10,
  },
  overlayText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.white,
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  errorText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.white,
    textAlign: 'center',
  },
  hint: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: '#FFFFFF40',
    textAlign: 'center',
    lineHeight: 20,
  },
  manualBtn: {
    backgroundColor: '#FFFFFF10',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  manualBtnText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: '#FFFFFF80',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontFamily: typography.headingS.fontFamily,
    fontSize: typography.headingS.fontSize,
    color: colors.textPrimary,
  },
  modalSub: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textMuted,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: typography.bodyM.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancel: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  modalCancelText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
