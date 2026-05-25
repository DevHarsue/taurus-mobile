import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { useDevices } from '@features/dashboard/hooks/useDevices';
import { colors, typography, spacing, radii } from '@theme/index';
import type { IDevice } from '@app-types/device';

interface Props {
  selectedDeviceCode: string;
  onSelect: (deviceCode: string) => void;
  disabled?: boolean;
}

export function DeviceSelector({ selectedDeviceCode, onSelect, disabled }: Props) {
  const { data: devices, loading } = useDevices();
  const [visible, setVisible] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const selected = devices?.find((d) => d.deviceCode === selectedDeviceCode);
  const hasDevices = (devices?.length ?? 0) > 0;

  const handleSelect = (device: IDevice) => {
    onSelect(device.deviceCode);
    setVisible(false);
  };

  const handleManualConfirm = () => {
    if (manualInput.trim()) {
      onSelect(manualInput.trim());
      setVisible(false);
      setManualInput('');
    }
  };

  return (
    <>
      <Pressable onPress={() => !disabled && setVisible(true)} disabled={disabled}>
        <Card style={[styles.selectorCard, disabled && styles.selectorDisabled]}>
          <Text style={styles.cardLabel}>DISPOSITIVO</Text>
          <View style={styles.selectorRow}>
            <View style={styles.selectorInfo}>
              {selected ? (
                <>
                  <Text style={styles.selectorName}>{selected.name}</Text>
                  <Text style={styles.selectorCode}>{selected.deviceCode}</Text>
                </>
              ) : selectedDeviceCode ? (
                <Text style={styles.selectorName}>{selectedDeviceCode}</Text>
              ) : (
                <Text style={styles.selectorPlaceholder}>
                  {loading ? 'Cargando...' : 'Seleccionar dispositivo'}
                </Text>
              )}
            </View>
            <ChevronDown size={18} color={colors.textMuted} strokeWidth={2} />
          </View>
        </Card>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar dispositivo</Text>

            {hasDevices ? (
              <FlatList<IDevice>
                data={devices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.deviceRow,
                      item.deviceCode === selectedDeviceCode && styles.deviceRowActive,
                    ]}
                  >
                    <View style={styles.deviceRowInfo}>
                      <Text style={styles.deviceRowName}>{item.name}</Text>
                      <Text style={styles.deviceRowCode}>{item.deviceCode}</Text>
                    </View>
                    <Badge
                      label={item.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                      variant={item.status === 'online' ? 'active' : 'neutral'}
                      badgeStyle="dot"
                    />
                  </Pressable>
                )}
                style={styles.deviceList}
              />
            ) : (
              <Text style={styles.noDevices}>
                No hay dispositivos registrados. Ingresa el codigo manualmente:
              </Text>
            )}

            <View style={styles.manualSection}>
              <Text style={styles.manualLabel}>INGRESAR MANUALMENTE</Text>
              <View style={styles.manualRow}>
                <TextInput
                  value={manualInput}
                  onChangeText={setManualInput}
                  placeholder="esp32-recepcion"
                  placeholderTextColor={colors.textMuted}
                  style={styles.manualInput}
                  autoCapitalize="none"
                />
                <Pressable onPress={handleManualConfirm} style={styles.manualBtn}>
                  <Text style={styles.manualBtnText}>OK</Text>
                </Pressable>
              </View>
            </View>

            <Pressable onPress={() => setVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorCard: { padding: 16, gap: 8 },
  selectorDisabled: { opacity: 0.5 },
  cardLabel: {
    fontFamily: typography.labelS.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorInfo: { flex: 1, gap: 2 },
  selectorName: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textPrimary,
  },
  selectorCode: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 11,
    color: colors.textMuted,
  },
  selectorPlaceholder: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.xxl,
    gap: 12,
    maxHeight: '70%',
  },
  modalTitle: {
    fontFamily: typography.headingXS.fontFamily,
    fontSize: typography.headingXS.fontSize,
    color: colors.textPrimary,
  },
  deviceList: { maxHeight: 250 },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  deviceRowActive: {
    backgroundColor: colors.backgroundCard,
  },
  deviceRowInfo: { flex: 1, gap: 2 },
  deviceRowName: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textPrimary,
  },
  deviceRowCode: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 11,
    color: colors.textMuted,
  },
  noDevices: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  manualSection: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
    gap: 8,
  },
  manualLabel: {
    fontFamily: typography.labelS.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textPrimary,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  manualBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.textPrimary,
    borderRadius: radii.sm,
  },
  manualBtnText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.white,
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.badgeExpired,
  },
});
