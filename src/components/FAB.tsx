import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, sizes, radii, colors } from '@theme/index';

export interface IFABProps {
  onPress: () => void;
  icon?: React.ReactNode;
}

export function FAB({ onPress, icon }: IFABProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, { opacity: pressed ? 0.85 : 1 }]}
    >
      <LinearGradient
        colors={[...gradients.primary]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        {icon ?? <Text style={styles.plus}>+</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: sizes.fabSize,
    height: sizes.fabSize,
    borderRadius: radii.fab,
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gradient: {
    flex: 1,
    borderRadius: radii.fab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
