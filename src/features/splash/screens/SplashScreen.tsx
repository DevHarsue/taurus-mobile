import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '@theme/index';

interface ISplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: ISplashScreenProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      onFinish();
    });
  }, [onFinish, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#2D0000', '#0A0000', '#000000']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoFrame}>
          <Text style={styles.logoPlaceholder}>T</Text>
        </View>

        <Text style={styles.title}>TAURUS</Text>
        <Text style={styles.subtitle}>ELITE PERFORMANCE ARCHITECTURE</Text>

        <View style={styles.spacer} />

        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>INITIALIZING PROTOCOL</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  logoFrame: {
    width: 180,
    height: 180,
    borderRadius: 24,
    backgroundColor: '#1A0000',
    borderWidth: 1,
    borderColor: '#93030340',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoPlaceholder: {
    fontSize: 72,
    fontFamily: 'Lexend_800ExtraBold',
    color: '#930303',
  },
  title: {
    fontFamily: typography.titleXL.fontFamily,
    fontSize: typography.titleXL.fontSize,
    letterSpacing: typography.titleXL.letterSpacing,
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 3,
    color: '#FFFFFF60',
  },
  spacer: {
    height: 80,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#FFFFFF15',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#930303',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: '#FFFFFF40',
  },
});
