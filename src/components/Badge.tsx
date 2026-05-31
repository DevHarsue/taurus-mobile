import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { typography, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';

type BadgeStyle = 'solid' | 'pill' | 'dot';
type Variant = 'active' | 'expired' | 'neutral' | 'warning';

type Props = {
  label: string;
  variant?: Variant;
  badgeStyle?: BadgeStyle;
};

function variantConfig(colors: Colors) {
  return {
    active: { bg: colors.badgeActive, pillBg: colors.badgeActiveBg, text: colors.white, pillText: colors.badgeActive, dot: colors.badgeActive },
    expired: { bg: colors.badgeExpired, pillBg: colors.badgeExpiredBg, text: colors.white, pillText: colors.primaryRed, dot: colors.badgeExpired },
    warning: { bg: colors.warning, pillBg: '#F59E0B15', text: colors.white, pillText: colors.warning, dot: colors.warning },
    neutral: { bg: '#E5E7EB', pillBg: '#E5E7EB30', text: colors.white, pillText: colors.textSecondary, dot: colors.textSecondary },
  } as const;
}

export function Badge({ label, variant = 'neutral', badgeStyle = 'solid' }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const config = variantConfig(colors)[variant];

  if (badgeStyle === 'dot') {
    return (
      <View style={styles.dotRow}>
        <View style={[styles.dot, { backgroundColor: config.dot }]} />
        <Text style={[styles.dotText, { color: config.dot }]}>{label}</Text>
      </View>
    );
  }

  if (badgeStyle === 'pill') {
    return (
      <View style={[styles.badge, { backgroundColor: config.pillBg }]}>
        <Text style={[styles.text, { color: config.pillText }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const createStyles = (_colors: Colors) =>
  StyleSheet.create({
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    text: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.bodyXS.fontSize,
      fontWeight: '600',
    },
    dotRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    dotText: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
  });
