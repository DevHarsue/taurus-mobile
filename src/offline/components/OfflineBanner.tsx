import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import { typography } from '@theme/index';
import { useConnectivity } from '../ConnectivityContext';
import { useOutbox } from '../OutboxContext';

/**
 * Banner global "Sin conexión". Se muestra sobre el contenido cuando
 * no hay internet; incluye el contador de operaciones pendientes.
 */
export function OfflineBanner() {
  const { isOnline } = useConnectivity();
  const { pendingCount } = useOutbox();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(), []);

  if (isOnline) return null;

  const pendingText =
    pendingCount > 0
      ? ` · ${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}`
      : '';

  return (
    <View style={[styles.banner, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <WifiOff size={13} color="#ffffff" strokeWidth={2.5} />
        <Text style={styles.text}>Sin conexión{pendingText}</Text>
      </View>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    banner: {
      backgroundColor: '#3d0000',
      width: '100%',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 5,
    },
    text: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 11,
      fontWeight: '600',
      color: '#ffffff',
      letterSpacing: 0.5,
    },
  });
