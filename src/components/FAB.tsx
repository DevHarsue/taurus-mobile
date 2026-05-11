import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { gradients, sizes, radii, colors } from '@theme/index';

export interface IFABProps {
  onPress: () => void;
  icon?: React.ReactNode;
}

export function FAB({ onPress, icon }: IFABProps) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        { bottom: 80 + insets.bottom + 16, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <LinearGradient
        colors={[...gradients.primary]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        {icon ?? <Plus size={28} color={colors.white} strokeWidth={2.4} />}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
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
});
