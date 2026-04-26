import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '@components/ScreenHeader';
import { GradientButton } from '@components/GradientButton';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { useEnrollFingerprint } from '../hooks/useEnrollFingerprint';
import { colors, typography, spacing } from '@theme/index';
import type { FingerprintEnrollScreenProps } from '@navigation/types';

const DEFAULT_DEVICE_ID = 'esp32-recepcion';

const STEP_LABEL: Record<string, string> = {
  idle: 'Listo para empezar',
  starting: 'Conectando con el sensor…',
  place_finger: 'Coloca el dedo en el sensor',
  remove_finger: 'Quita el dedo',
  place_again: 'Coloca el mismo dedo otra vez',
  building: 'Procesando la huella…',
  done: 'Finalizado',
  delete: 'Borrando huella',
};

export default function FingerprintEnrollScreen({
  route,
}: FingerprintEnrollScreenProps) {
  const { memberId, memberName } = route.params;
  const nav = useNavigation();
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
  const { state, start, cancel, reset } = useEnrollFingerprint(
    memberId,
    deviceId,
  );

  useEffect(() => {
    return () => {
      if (state.status === 'in_progress') {
        void cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInProgress = state.status === 'in_progress' || state.starting;
  const isDone = state.status === 'success';
  const isFailed = state.status === 'failed' || state.status === 'timeout';

  const stepLabel = STEP_LABEL[state.step] ?? state.step;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Enrolar huella" onBack={() => nav.goBack()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>HUELLA{'\n'}DEL MIEMBRO</Text>
        <Text style={styles.subtitle}>{memberName}</Text>

        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Dispositivo (device_id MQTT)</Text>
          <TextInput
            value={deviceId}
            onChangeText={setDeviceId}
            editable={!isInProgress}
            placeholder="esp32-recepcion"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
          />
        </Card>

        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>ESTADO</Text>
            <Badge
              label={
                isDone
                  ? 'EXITO'
                  : isFailed
                    ? 'ERROR'
                    : isInProgress
                      ? 'EN CURSO'
                      : 'INACTIVO'
              }
              variant={
                isDone ? 'active' : isFailed ? 'expired' : 'neutral'
              }
              badgeStyle="dot"
            />
          </View>

          <Text style={styles.stepText}>{stepLabel}</Text>
          {state.message ? (
            <Text style={styles.messageText}>{state.message}</Text>
          ) : null}

          {state.fingerprintId !== undefined ? (
            <Text style={styles.slotText}>
              Slot asignado: #{state.fingerprintId}
            </Text>
          ) : null}

          {isInProgress ? (
            <View style={styles.spinnerRow}>
              <ActivityIndicator color={colors.primaryRed} />
              <Text style={styles.spinnerText}>
                Sigue las instrucciones en el sensor…
              </Text>
            </View>
          ) : null}

          {state.error ? (
            <Text style={styles.errorText}>{state.error}</Text>
          ) : null}
        </Card>

        {!isInProgress && !isDone ? (
          <GradientButton title="Iniciar enrolamiento" onPress={start} />
        ) : null}

        {isInProgress ? (
          <Pressable onPress={cancel} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
        ) : null}

        {isDone || isFailed ? (
          <>
            <GradientButton
              title="Volver al miembro"
              onPress={() => nav.goBack()}
            />
            <Pressable onPress={reset} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Enrolar otra huella</Text>
            </Pressable>
          </>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xxl, gap: 16 },
  title: {
    fontFamily: typography.titleM.fontFamily,
    fontSize: typography.titleM.fontSize,
    color: colors.textPrimary,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: typography.bodySM.fontFamily,
    fontSize: typography.bodySM.fontSize,
    color: colors.textMuted,
  },
  card: { padding: 16, gap: 8 },
  cardLabel: {
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
  statusCard: { padding: 16, gap: 12 },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: typography.labelS.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  stepText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: 18,
    color: colors.textPrimary,
  },
  messageText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textMuted,
  },
  slotText: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 12,
    color: colors.textMuted,
  },
  spinnerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spinnerText: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 12,
    color: colors.textMuted,
  },
  errorText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.badgeExpired,
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  cancelBtnText: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.badgeExpired,
  },
});
