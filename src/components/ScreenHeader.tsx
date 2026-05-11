import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
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
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: insets.top,
          height: sizes.headerHeight + insets.top,
        },
      ]}
    >
      <View style={styles.left}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={8}>
            <ChevronLeft
              size={26}
              strokeWidth={2}
              color={backgroundColor === colors.black || backgroundColor === colors.backgroundDark ? colors.white : colors.textPrimary}
            />
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
