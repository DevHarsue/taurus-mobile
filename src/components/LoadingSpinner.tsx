import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '@theme/index';

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.primaryRed} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bgLight
  }
});