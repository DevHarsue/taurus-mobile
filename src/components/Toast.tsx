import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  XCircle,
} from 'lucide-react-native';
import { typography, radii, spacing, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

function variantStyle(
  colors: Colors,
): Record<ToastVariant, { bg: string; Icon: typeof CheckCircle }> {
  return {
    success: { bg: colors.badgeActive, Icon: CheckCircle },
    error: { bg: colors.badgeExpired, Icon: XCircle },
    warning: { bg: colors.warning, Icon: AlertTriangle },
    // No hay token azul en el theme; se usa el mismo azul "info" que AlertBanner.
    info: { bg: '#1E40AF', Icon: Info },
  };
}

export interface IToastItemProps {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  onDismiss: (id: string) => void;
}

export function ToastItem({
  id,
  message,
  variant,
  duration,
  onDismiss,
}: IToastItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-24)).current;
  const { bg, Icon } = variantStyle(colors)[variant];

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -24,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(id));
  }, [id, onDismiss, opacity, translateY]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration, opacity, translateY]);

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor: bg, opacity, transform: [{ translateY }] }]}
    >
      <Icon size={20} color={colors.white} strokeWidth={2.5} />
      <Text style={styles.message} numberOfLines={3}>
        {message}
      </Text>
      <Pressable onPress={dismiss} hitSlop={8}>
        <X size={18} color={colors.white} />
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.md,
      marginBottom: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    message: {
      flex: 1,
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.white,
    },
  });
