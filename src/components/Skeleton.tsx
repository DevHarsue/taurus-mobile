import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type DimensionValue,
  type ViewStyle,
} from 'react-native';
import { radii, spacing, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';

export interface ISkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Rectangulo gris con efecto shimmer (pulso de opacidad) usando `Animated`.
 * No requiere librerias externas.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = radii.sm,
  style,
}: ISkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.inputBgAlt, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonText({
  width = '100%',
  style,
}: {
  width?: DimensionValue;
  style?: ViewStyle;
}) {
  return <Skeleton width={width} height={12} borderRadius={6} style={style} />;
}

export function SkeletonAvatar({ size = 42 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

export function SkeletonCard({
  height = 120,
  style,
}: {
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <Skeleton width="100%" height={height} borderRadius={radii.lg} style={style} />
  );
}

export function SkeletonList({
  count = 6,
  renderItem,
  gap = spacing.md,
}: {
  count?: number;
  renderItem: (index: number) => React.ReactElement;
  gap?: number;
}) {
  return (
    <View style={[styles.list, { gap }]}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{renderItem(i)}</React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { width: '100%' },
});
