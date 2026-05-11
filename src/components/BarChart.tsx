import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@theme/index';

export interface IBarChartItem {
  label: string;
  value: number;
}

interface Props {
  data: IBarChartItem[];
  barColor?: string;
  height?: number;
}

export function BarChart({ data, barColor = colors.primaryRed, height = 140 }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.barsRow}>
        {data.map((item, i) => {
          const barHeight = (item.value / max) * (height - 28);
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 2),
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    minWidth: 6,
    maxWidth: 28,
    borderRadius: 4,
  },
  label: {
    marginTop: spacing.xs,
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
