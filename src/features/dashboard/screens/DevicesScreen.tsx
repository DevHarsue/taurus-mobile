import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2 } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { FAB } from '@components/FAB';
import { GradientButton } from '@components/GradientButton';
import { useDevices, useCreateDevice, useDeleteDevice } from '../hooks/useDevices';
import { colors, typography, spacing, radii } from '@theme/index';
import type { IDevice } from '@app-types/device';

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Nunca';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

export default function DevicesScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const devicesQuery = useDevices();
  const { mutate: createDevice, loading: creating } = useCreateDevice(() => {
    devicesQuery.refetch();
    setModalVisible(false);
    resetForm();
  });
  const { mutate: deleteDevice } = useDeleteDevice(() => devicesQuery.refetch());

  const [modalVisible, setModalVisible] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormLocation('');
  };

  const handleCreate = () => {
    if (!formCode.trim() || !formName.trim()) return;
    void createDevice({
      deviceCode: formCode.trim(),
      name: formName.trim(),
      location: formLocation.trim() || undefined,
    });
  };

  const handleDelete = (device: IDevice) => {
    const doDelete = () => void deleteDevice(device.id);
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar el dispositivo "${device.name}"?`)) doDelete();
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Eliminar dispositivo', `¿Eliminar "${device.name}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const renderDevice = ({ item }: { item: IDevice }) => (
    <Card style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceCode}>{item.deviceCode}</Text>
        </View>
        <Badge
          label={item.status === 'online' ? 'ONLINE' : 'OFFLINE'}
          variant={item.status === 'online' ? 'active' : 'neutral'}
          badgeStyle="dot"
        />
      </View>
      {item.location ? (
        <Text style={styles.deviceLocation}>📍 {item.location}</Text>
      ) : null}
      <View style={styles.deviceFooter}>
        <Text style={styles.lastSeen}>{formatRelativeTime(item.lastSeenAt)}</Text>
        <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
          <Trash2 size={18} color={colors.badgeExpired} strokeWidth={2} />
        </Pressable>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Dispositivos" onBack={() => nav.goBack()} />

      <FlatList<IDevice>
        data={devicesQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        refreshControl={
          <RefreshControl
            refreshing={devicesQuery.loading}
            onRefresh={devicesQuery.refetch}
            tintColor={colors.primaryRed}
            colors={[colors.primaryRed]}
          />
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !devicesQuery.loading ? (
            <Text style={styles.empty}>No hay dispositivos registrados</Text>
          ) : null
        }
      />

      <FAB onPress={() => setModalVisible(true)} />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>Registrar dispositivo</Text>

            <Text style={styles.fieldLabel}>CODIGO DEL DISPOSITIVO</Text>
            <TextInput
              value={formCode}
              onChangeText={setFormCode}
              placeholder="esp32-recepcion"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>NOMBRE</Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="Lector Recepcion"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>UBICACION (OPCIONAL)</Text>
            <TextInput
              value={formLocation}
              onChangeText={setFormLocation}
              placeholder="Entrada principal"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <GradientButton
              title="Registrar"
              onPress={handleCreate}
              loading={creating}
            />

            <Pressable
              onPress={() => { setModalVisible(false); resetForm(); }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundCard },
  list: { padding: spacing.xl, gap: 12 },
  empty: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
  },
  deviceCard: { padding: 16, gap: 8 },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceInfo: { flex: 1, gap: 2 },
  deviceName: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textPrimary,
  },
  deviceCode: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  deviceLocation: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 12,
    color: colors.textMuted,
  },
  deviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  lastSeen: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 11,
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
  },
  modalTitle: {
    fontFamily: typography.headingXS.fontFamily,
    fontSize: typography.headingXS.fontSize,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: typography.labelS.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  input: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textPrimary,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.badgeExpired,
  },
});
