import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card } from '@components/Card';
import { ScreenHeader } from '@components/ScreenHeader';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, type Colors } from '@theme/index';
import type { ExerciseDetailScreenProps } from '@navigation/types';

function Stat({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ExerciseDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<ExerciseDetailScreenProps['route']>();
  const { exercise, dayLabel } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Ejercicio"
        onBack={() => nav.goBack()}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!!dayLabel && <Text style={styles.dayLabel}>{dayLabel}</Text>}
        <Text style={styles.name}>{exercise.exerciseName}</Text>

        <View style={styles.statsRow}>
          <Stat label="SERIES" value={String(exercise.sets)} styles={styles} />
          {exercise.measurementType === 'time' ? (
            <Stat
              label="TIEMPO"
              value={
                exercise.durationSeconds ? `${exercise.durationSeconds}s` : '—'
              }
              styles={styles}
            />
          ) : exercise.measurementType === 'distance' ? (
            <Stat
              label="DISTANCIA"
              value={exercise.distance ?? '—'}
              styles={styles}
            />
          ) : (
            <Stat label="REPS" value={exercise.reps} styles={styles} />
          )}
          {exercise.restSeconds != null && (
            <Stat
              label="DESCANSO"
              value={`${exercise.restSeconds}s`}
              styles={styles}
            />
          )}
        </View>

        {(exercise.weight || exercise.rpe) && (
          <Card style={styles.card}>
            {!!exercise.weight && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Peso sugerido</Text>
                <Text style={styles.cardValue}>{exercise.weight}</Text>
              </View>
            )}
            {!!exercise.rpe && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>RPE</Text>
                <Text style={styles.cardValue}>{exercise.rpe}</Text>
              </View>
            )}
          </Card>
        )}

        {!!exercise.notes && (
          <Card style={styles.card}>
            <Text style={styles.notesTitle}>Notas del entrenador</Text>
            <Text style={styles.notes}>{exercise.notes}</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, gap: 16 },
    dayLabel: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      letterSpacing: 1.5,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    name: {
      fontFamily: typography.titleS.fontFamily,
      fontSize: typography.titleS.fontSize,
      color: colors.textPrimary,
    },
    statsRow: { flexDirection: 'row', gap: 12 },
    stat: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      fontFamily: typography.statM.fontFamily,
      fontSize: typography.statM.fontSize,
      color: colors.textPrimary,
    },
    statLabel: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      letterSpacing: 1,
      color: colors.textMuted,
    },
    card: { padding: 16, gap: 10 },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardLabel: {
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textMuted,
    },
    cardValue: {
      fontFamily: typography.headingXS.fontFamily,
      fontSize: typography.headingXS.fontSize,
      color: colors.textPrimary,
    },
    notesTitle: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      letterSpacing: 1,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    notes: {
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textPrimary,
      lineHeight: 22,
    },
  });
