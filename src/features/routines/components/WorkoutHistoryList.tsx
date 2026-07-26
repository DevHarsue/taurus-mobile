import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { useTheme } from '@hooks/useTheme';
import { formatDateOnly } from '@utils/dates';
import type { SetLog, WorkoutLog } from '@app-types/routine';
import { typography, type Colors } from '@theme/index';

const STATUS: Record<
  WorkoutLog['status'],
  { label: string; variant: 'active' | 'warning' | 'neutral' }
> = {
  completed: { label: 'Completado', variant: 'active' },
  partial: { label: 'Parcial', variant: 'warning' },
  skipped: { label: 'Saltado', variant: 'neutral' },
};

function formatSet(s: SetLog): string {
  if (s.durationDone != null) return `${s.durationDone}s`;
  if (s.distanceDone != null) return `${s.distanceDone}`;
  const reps = s.repsDone != null ? `${s.repsDone}` : '–';
  const weight = s.weightDone != null ? ` × ${s.weightDone}kg` : '';
  return `${reps}${weight}`;
}

function groupByExercise(sets: SetLog[]): { name: string; detail: string }[] {
  const map = new Map<string, SetLog[]>();
  for (const s of sets) {
    const arr = map.get(s.exerciseName) ?? [];
    arr.push(s);
    map.set(s.exerciseName, arr);
  }
  return Array.from(map.entries()).map(([name, list]) => ({
    name,
    detail: list.map(formatSet).join('  |  '),
  }));
}

/**
 * Lista de tarjetas de entrenamientos registrados (fecha, día, estado y
 * series por ejercicio). Compartida entre el historial propio del miembro
 * y la vista de seguimiento del admin.
 */
export function WorkoutHistoryList({ logs }: { logs: WorkoutLog[] }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.list}>
      {logs.map((logEntry) => {
        const status = STATUS[logEntry.status] ?? STATUS.completed;
        const grouped = groupByExercise(logEntry.sets);
        return (
          <Card key={logEntry.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.date}>
                  {formatDateOnly(logEntry.performedOn)}
                </Text>
                {!!logEntry.dayLabel && (
                  <Text style={styles.dayLabel}>{logEntry.dayLabel}</Text>
                )}
              </View>
              <Badge
                label={status.label}
                variant={status.variant}
                badgeStyle="pill"
              />
            </View>

            {grouped.map((g, i) => (
              <View key={i} style={styles.exRow}>
                <Text style={styles.exName}>{g.name}</Text>
                <Text style={styles.exDetail}>{g.detail}</Text>
              </View>
            ))}

            {!!logEntry.notes && (
              <Text style={styles.notes}>{logEntry.notes}</Text>
            )}
          </Card>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    list: { gap: 12 },
    card: { padding: 16, gap: 8 },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    date: {
      fontFamily: typography.headingXS.fontFamily,
      fontSize: typography.headingXS.fontSize,
      color: colors.textPrimary,
    },
    dayLabel: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    exRow: {
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 8,
    },
    exName: {
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textPrimary,
    },
    exDetail: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    notes: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 4,
    },
  });
