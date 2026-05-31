import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { radii, spacing, typography, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';

export interface IFilterChip {
  key: string;
  label: string;
}

export interface IFilterChipsProps {
  chips: IFilterChip[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function FilterChips({ chips, activeKey, onSelect }: IFilterChipsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {chips.map((chip) => {
        const isActive = chip.key === activeKey;
        return (
          <Pressable
            key={chip.key}
            onPress={() => onSelect(chip.key)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    scroll: {
      flexGrow: 0,
      flexShrink: 0,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 2,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.surface,
    },
    chipActive: {
      backgroundColor: colors.textPrimary,
      borderColor: colors.textPrimary,
    },
    chipText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyXS.fontSize,
      color: colors.textPrimary,
    },
    chipTextActive: {
      color: colors.background,
    },
  });
