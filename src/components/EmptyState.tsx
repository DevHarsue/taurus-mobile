import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/index';

type Props = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center'
  },
  title: {
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 6
  },
  description: {
    color: theme.colors.textSecondary,
    textAlign: 'center'
  }
});