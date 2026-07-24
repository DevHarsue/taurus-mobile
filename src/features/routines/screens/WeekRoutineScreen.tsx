import React, { useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Dumbbell } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { EmptyState } from '@components/EmptyState';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import { useMySchedule } from '../hooks/useMyRoutine';
import { dayForWeekday, getCurrentWeekday } from '../utils/schedule';
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  type RoutineExercise,
} from '@app-types/routine';
import { typography, spacing, type Colors } from '@theme/index';

function exerciseSummary(ex: RoutineExercise): string {
  switch (ex.measurementType) {
    case 'time':
      return `${ex.sets}× ${ex.durationSeconds ?? '-'}s`;
    case 'distance':
      return `${ex.sets}× ${ex.distance ?? '-'}`;
    default:
      return `${ex.sets}×${ex.reps}`;
  }
}

export default function WeekRoutineScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const query = useMySchedule();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const schedule = query.data ?? null;
  const todayWeekday = getCurrentWeekday();
  const hasSchedule = (schedule?.length ?? 0) > 0;

  if (query.loading && !query.data) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Mi semana"
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
            onRefresh={() => {
              haptics.light();
              query.refetch();
            }}
            tintColor={colors.primaryRed}
            colors={[colors.primaryRed]}
          />
        }
      >
        {!hasSchedule ? (
          <EmptyState
            icon={Dumbbell}
            title="Sin rutina asignada"
            description="Tu horario semanal aparecerá aquí cuando te lo asignen."
          />
        ) : (
          WEEKDAYS.map((weekday) => {
            const day = dayForWeekday(schedule, weekday);
            const isToday = weekday === todayWeekday;
            return (
              <Card
                key={weekday}
                style={[styles.dayCard, isToday && styles.dayCardToday]}
              >
                <View style={styles.dayHeader}>
                  <Text
                    style={[
                      styles.weekdayLabel,
                      isToday && styles.weekdayLabelToday,
                    ]}
                  >
                    {WEEKDAY_LABELS[weekday]}
                  </Text>
                  {isToday && <Badge label="Hoy" variant="expired" badgeStyle="pill" />}
                </View>

                {day ? (
                  <>
                    <Text style={styles.routineName}>{day.routineName}</Text>
                    <Text style={styles.dayName}>{day.dayLabel}</Text>
                    {day.exercises.map((ex) => (
                      <Text key={ex.id} style={styles.exLine}>
                        •  {ex.exerciseName}{'  '}
                        <Text style={styles.exMeta}>{exerciseSummary(ex)}</Text>
                      </Text>
                    ))}
                  </>
                ) : (
                  <Text style={styles.restText}>Descanso</Text>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, gap: 10 },
    dayCard: { padding: 16, gap: 4 },
    dayCardToday: { borderWidth: 1.5, borderColor: colors.primaryRed },
    dayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    weekdayLabel: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      letterSpacing: 1.5,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    weekdayLabelToday: { color: colors.primaryRed },
    routineName: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
    },
    dayName: {
      fontFamily: typography.headingXS.fontFamily,
      fontSize: typography.headingXS.fontSize,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    exLine: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    exMeta: { color: colors.textMuted },
    restText: {
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textMuted,
    },
  });
