import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { sizes, spacing, typography, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';

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
  backgroundColor,
}: IScreenHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const bg = backgroundColor ?? colors.background;
  const insets = useSafeAreaInsets();
  const onDark = bg === colors.black || bg === colors.backgroundDark;
  const titleColor = onDark ? colors.white : colors.textPrimary;
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
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
              color={titleColor}
            />
          </Pressable>
        )}
        {leftContent}
        {title && (
          <Text
            style={[
              styles.title,
              {
                color: titleColor,
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

const createStyles = (_colors: Colors) =>
  StyleSheet.create({
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
