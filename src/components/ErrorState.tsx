import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors, typography, spacing } from '@theme/index';
import { GradientButton } from './GradientButton';

export interface IErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Estado de error con icono, mensaje y boton "Reintentar".
 * Usado por QueryRenderer cuando una query falla.
 */
export function ErrorState({
  message = 'Ocurrio un error al cargar los datos',
  onRetry,
}: IErrorStateProps) {
  return (
    <View style={styles.container}>
      <AlertCircle size={48} color={colors.badgeExpired} strokeWidth={1.5} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <View style={styles.button}>
          <GradientButton title="Reintentar" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  message: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    width: 200,
    marginTop: spacing.sm,
  },
});
