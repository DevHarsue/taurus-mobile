import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, sizes, spacing, typography } from '@theme/index';

export interface IScreenHeaderProps {
  title?: string;
  leftContent?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onBack?: () => void;
  onRightPress?: () => void;
  backgroundColor?: string;
}

export function ScreenHeader({
  title,
  leftContent,
  rightIcon,
  onBack,
  onRightPress,
  backgroundColor = colors.white,
}: IScreenHeaderProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.left}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={8}>
            <Text style={[styles.backArrow, { color: backgroundColor === colors.black || backgroundColor === colors.backgroundDark ? colors.white : colors.textPrimary }]}>
              {'<'}
            </Text>
          </Pressable>
        )}
        {leftContent}
        {title && (
          <Text
            style={[
              styles.title,
              {
                color:
                  backgroundColor === colors.black || backgroundColor === colors.backgroundDark
                    ? colors.white
                    : colors.textPrimary,
              },
            ]}
          >
            {title}
          </Text>
        )}
      </View>
      {rightIcon && (
        <Pressable onPress={onRightPress} hitSlop={8}>
          {rightIcon}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: sizes.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '300',
  },
  title: {
    fontFamily: typography.bodyM.fontFamily,
    fontSize: typography.bodyM.fontSize,
  },
});
