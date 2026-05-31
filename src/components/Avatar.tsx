import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { typography, type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';

export interface IAvatarProps {
  size: number;
  uri?: string;
  name?: string;
  backgroundColor?: string;
}

export function Avatar({
  size,
  uri,
  name,
  backgroundColor,
}: IAvatarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const bg = backgroundColor ?? colors.backgroundCard;
  const borderRadius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius }]}
      />
    );
  }

  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '';

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius, backgroundColor: bg },
      ]}
    >
      <Text
        style={[
          styles.initials,
          { fontSize: size * 0.38 },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    image: {
      resizeMode: 'cover',
    },
    fallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    initials: {
      fontFamily: typography.bodyS.fontFamily,
      color: colors.textPrimaryAlpha50,
    },
  });
