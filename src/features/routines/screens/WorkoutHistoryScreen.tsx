import React, { useCallback, useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { History } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { EmptyState } from '@components/EmptyState';
import { QueryRenderer } from '@components/QueryRenderer';
import { SkeletonCard, SkeletonList } from '@components/Skeleton';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import { formatDateShort } from '@utils/dates';
import { useWorkoutHistory } from '../hooks/useMyRoutine';
import type { SetLog, WorkoutLog } from '@app-types/routine';
import { typography, spacing, type Colors } from '@theme/index';

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

export default function WorkoutHistoryScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const query = useWorkoutHistory();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const refresh = useCallback(() => {
    haptics.light();
    query.refetch();
  }, [query]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Historial"
        onBack={() => nav.goBack()}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={query.loading}
            onRefresh={refresh}
            tintColor={colors.primaryRed}
            colors={[colors.primaryRed]}
          />
        }
      >
        <Text style={styles.title}>Tus entrenamientos</Text>

        <QueryRenderer
          query={query}
          isEmpty={(d) => d.length === 0}
          skeleton={
            <SkeletonList
              count={4}
              renderItem={() => <SkeletonCard height={100} />}
            />
          }
          empty={
            <EmptyState
              icon={History}
              title="Sin entrenamientos aún"
              description="Cuando registres tu rutina del día, aparecerá aquí."
            />
          }
        >
          {(logs) => (
            <View style={styles.list}>
              {logs.map((logEntry) => {
                const status = STATUS[logEntry.status] ?? STATUS.completed;
                const grouped = groupByExercise(logEntry.sets);
                return (
                  <Card key={logEntry.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.date}>
                          {formatDateShort(logEntry.performedOn)}
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
          )}
        </QueryRenderer>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, gap: 8 },
    title: {
      fontFamily: typography.titleS.fontFamily,
      fontSize: typography.titleS.fontSize,
      color: colors.textPrimary,
      marginBottom: 8,
    },
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
