import React, { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { radii, typography, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';

export interface ISearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search members...',
}: ISearchBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPrimaryAlpha40}
        style={styles.input}
      />
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      height: 44,
      backgroundColor: colors.backgroundCard,
      borderRadius: radii.md,
      paddingHorizontal: 16,
      justifyContent: 'center',
    },
    input: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textPrimary,
    },
  });
