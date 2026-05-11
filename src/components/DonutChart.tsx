import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing } from '@theme/index';

export interface IDonutSegment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: IDonutSegment[];
  size?: number;
  strokeWidth?: number;
}

const CHART_COLORS = [
  colors.primaryRed,
  '#E67E22',
  '#2A7A3A',
  '#3498DB',
  '#9B59B6',
  '#1ABC9C',
];

export function DonutChart({ data, size = 120, strokeWidth = 14 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let accumulated = 0;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.divider}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {data.map((segment, i) => {
            const pct = segment.value / total;
            const dashLength = pct * circumference;
            const dashGap = circumference - dashLength;
            const rotation = (accumulated / total) * 360 - 90;
            accumulated += segment.value;

            return (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color || CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${dashLength} ${dashGap}`}
                strokeLinecap="butt"
                rotation={rotation}
                origin={`${size / 2}, ${size / 2}`}
              />
            );
          })}
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={styles.totalValue}>{total}</Text>
          <Text style={styles.totalLabel}>TOTAL</Text>
        </View>
      </View>
      <View style={styles.legend}>
        {data.map((segment, i) => (
          <View key={i} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: segment.color || CHART_COLORS[i % CHART_COLORS.length] },
              ]}
            />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {segment.label}
            </Text>
            <Text style={styles.legendValue}>{segment.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValue: {
    fontFamily: typography.statM.fontFamily,
    fontSize: 20,
    color: colors.textPrimary,
  },
  totalLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  legend: {
    flex: 1,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: typography.bodyXS.fontSize,
    color: colors.textSecondary,
  },
  legendValue: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textPrimary,
  },
});
