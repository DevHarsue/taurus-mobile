import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CalendarDays,
  Check,
  ChevronRight,
  Coffee,
  Dumbbell,
  History,
} from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { GradientButton } from '@components/GradientButton';
import { EmptyState } from '@components/EmptyState';
import { Skeleton } from '@components/Skeleton';
import { Avatar } from '@components/Avatar';
import { useGreeting } from '@hooks/useGreeting';
import { useToast } from '@hooks/useToast';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import { newUuid } from '@offline';
import { useMySchedule, useLogWorkout } from '../hooks/useMyRoutine';
import {
  deriveTodayWorkout,
  getCurrentWeekday,
  prescriptionLine,
} from '../utils/schedule';
import {
  WEEKDAY_LABELS,
  type LogSetRequest,
  type MeasurementType,
  type RoutineExercise,
  type ScheduledDay,
} from '@app-types/routine';
import { typography, spacing, type Colors } from '@theme/index';
import type { MemberRoutineStackParamList } from '@navigation/types';

interface SetEntry {
  reps: string;
  weight: string;
  duration: string;
  distance: string;
  done: boolean;
}
type LogState = Record<string, SetEntry[]>;

type FieldKey = 'reps' | 'weight' | 'duration' | 'distance';

/** Qué inputs mostrar por serie según el tipo de medición. */
function inputsFor(
  type: MeasurementType,
): { key: FieldKey; label: string; numeric: boolean; placeholder: string }[] {
  switch (type) {
    case 'reps':
      return [{ key: 'reps', label: 'REPS', numeric: true, placeholder: '10' }];
    case 'time':
      return [{ key: 'duration', label: 'SEG', numeric: true, placeholder: '30' }];
    case 'distance':
      return [{ key: 'distance', label: 'DIST', numeric: false, placeholder: 'km' }];
    case 'weight_reps':
    default:
      return [
        { key: 'reps', label: 'REPS', numeric: true, placeholder: '10' },
        { key: 'weight', label: 'KG', numeric: true, placeholder: '-' },
      ];
  }
}

function emptyEntry(): SetEntry {
  return { reps: '', weight: '', duration: '', distance: '', done: false };
}

function buildInitialLog(day: ScheduledDay | null): LogState {
  const state: LogState = {};
  if (!day) return state;
  for (const ex of day.exercises) {
    state[ex.id] = Array.from({ length: Math.max(ex.sets, 1) }, emptyEntry);
  }
  return state;
}

export default function TodayWorkoutScreen() {
  const nav =
    useNavigation<NativeStackNavigationProp<MemberRoutineStackParamList>>();
  const insets = useSafeAreaInsets();
  const { displayName } = useGreeting();
  const query = useMySchedule();
  const { mutate: logWorkout, loading: logging } = useLogWorkout();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const today = useMemo(
    () => deriveTodayWorkout(query.data ?? null),
    [query.data],
  );
  const day = today.day;

  const [log, setLog] = useState<LogState>({});

  useEffect(() => {
    setLog(buildInitialLog(day));
  }, [day]);

  const updateSet = (exId: string, setIdx: number, patch: Partial<SetEntry>) => {
    setLog((prev) => {
      const sets = prev[exId] ? [...prev[exId]] : [];
      sets[setIdx] = { ...sets[setIdx], ...patch };
      return { ...prev, [exId]: sets };
    });
  };

  const { doneSets, totalSetsCount } = useMemo(() => {
    let done = 0;
    let total = 0;
    Object.values(log).forEach((sets) => {
      sets.forEach((s) => {
        total += 1;
        if (s.done) done += 1;
      });
    });
    return { doneSets: done, totalSetsCount: total };
  }, [log]);

  const onSubmit = async () => {
    if (!day) return;
    const sets: LogSetRequest[] = [];
    for (const ex of day.exercises) {
      const entries = log[ex.id] ?? [];
      entries.forEach((entry, idx) => {
        const hasData =
          entry.done ||
          entry.reps ||
          entry.weight ||
          entry.duration ||
          entry.distance;
        if (!hasData) return;
        sets.push({
          routineExerciseId: ex.id,
          exerciseName: ex.exerciseName,
          setNumber: idx + 1,
          repsDone: entry.reps ? Number(entry.reps) : undefined,
          weightDone: entry.weight ? Number(entry.weight) : undefined,
          durationDone: entry.duration ? Number(entry.duration) : undefined,
          distanceDone: entry.distance ? Number(entry.distance) : undefined,
          done: entry.done,
        });
      });
    }

    if (sets.length === 0) {
      toast.error('Marca al menos una serie');
      return;
    }

    const status = doneSets >= totalSetsCount ? 'completed' : 'partial';
    const { queued } = await logWorkout({
      routineDayId: day.routineDayId,
      dayLabel: day.dayLabel,
      status,
      clientId: newUuid(),
      sets,
    });
    haptics.light();
    toast[queued ? 'info' : 'success'](
      queued
        ? 'Sin conexión: tu entrenamiento se guardará al reconectar'
        : '¡Entrenamiento registrado!',
    );
    setLog(buildInitialLog(day));
  };

  const refresh = useCallback(() => {
    haptics.light();
    query.refetch();
  }, [query]);

  const weekdayLabel = WEEKDAY_LABELS[getCurrentWeekday()];
  const hasSchedule = (query.data?.length ?? 0) > 0;

  return (
    <View style={styles.container}>
      <ScreenHeader
        leftContent={
          <View style={styles.headerLeft}>
            <Avatar size={32} name={displayName} backgroundColor={colors.primaryRed} />
            <Text style={styles.headerTitle}>Hola, {displayName}</Text>
          </View>
        }
        rightIcon={<History size={20} color={colors.textPrimary} strokeWidth={2} />}
        onRightPress={() => nav.navigate('WorkoutHistory')}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={query.loading}
            onRefresh={refresh}
            tintColor={colors.primaryRed}
            colors={[colors.primaryRed]}
          />
        }
      >
        <Text style={styles.sectionLabel}>{weekdayLabel.toUpperCase()}</Text>
        <Text style={styles.title}>Tu entrenamiento{'\n'}de hoy</Text>

        {query.loading && !query.data ? (
          <View style={{ gap: 12, marginTop: 8 }}>
            <Skeleton width="100%" height={90} borderRadius={16} />
            <Skeleton width="100%" height={90} borderRadius={16} />
          </View>
        ) : !hasSchedule ? (
          <EmptyState
            icon={Dumbbell}
            title="Aún no tienes una rutina"
            description="Cuando el gimnasio te asigne rutinas por día, aparecerán aquí."
          />
        ) : today.isRestDay || !day ? (
          <Card style={styles.restCard}>
            <Coffee size={40} color={colors.primaryRed} strokeWidth={1.6} />
            <Text style={styles.restTitle}>Día de descanso</Text>
            <Text style={styles.restDesc}>Hoy no toca entrenar según tu horario.</Text>
            <Pressable
              style={styles.weekLink}
              onPress={() => nav.navigate('WeekRoutine')}
            >
              <CalendarDays size={16} color={colors.primaryRed} />
              <Text style={styles.weekLinkText}>Ver mi semana</Text>
            </Pressable>
          </Card>
        ) : (
          <>
            <View style={styles.dayHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.routineName}>{day.routineName}</Text>
                <Text style={styles.dayLabel}>{day.dayLabel}</Text>
              </View>
              <Pressable
                style={styles.weekLink}
                onPress={() => nav.navigate('WeekRoutine')}
              >
                <CalendarDays size={16} color={colors.primaryRed} />
                <Text style={styles.weekLinkText}>Semana</Text>
              </Pressable>
            </View>

            <Text style={styles.progress}>
              {doneSets}/{totalSetsCount} series completadas
            </Text>

            {day.exercises.map((ex: RoutineExercise) => {
              const fields = inputsFor(ex.measurementType);
              return (
                <Card key={ex.id} style={styles.exCard}>
                  <Pressable
                    style={styles.exHeader}
                    onPress={() =>
                      nav.navigate('ExerciseDetail', {
                        exercise: ex,
                        dayLabel: day.dayLabel,
                      })
                    }
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exName}>{ex.exerciseName}</Text>
                      <Text style={styles.exPrescription}>
                        {prescriptionLine(ex)}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </Pressable>

                  {!!ex.notes && <Text style={styles.exNotes}>{ex.notes}</Text>}

                  <View style={styles.setsHeader}>
                    <Text style={[styles.setsHeaderText, styles.colSet]}>SERIE</Text>
                    {fields.map((f) => (
                      <Text
                        key={f.key}
                        style={[styles.setsHeaderText, styles.colInput]}
                      >
                        {f.label}
                      </Text>
                    ))}
                    <Text style={[styles.setsHeaderText, styles.colCheck]}>✓</Text>
                  </View>

                  {(log[ex.id] ?? []).map((entry, idx) => (
                    <View key={idx} style={styles.setRow}>
                      <Text style={[styles.setNumber, styles.colSet]}>
                        {idx + 1}
                      </Text>
                      {fields.map((f) => (
                        <View key={f.key} style={styles.colInput}>
                          <TextInput
                            style={styles.setInput}
                            value={entry[f.key]}
                            onChangeText={(t) =>
                              updateSet(ex.id, idx, { [f.key]: t })
                            }
                            keyboardType={f.numeric ? 'numeric' : 'default'}
                            placeholder={f.placeholder}
                            placeholderTextColor={colors.textPrimaryAlpha40}
                          />
                        </View>
                      ))}
                      <View style={styles.colCheck}>
                        <Pressable
                          onPress={() =>
                            updateSet(ex.id, idx, { done: !entry.done })
                          }
                          style={[
                            styles.checkBox,
                            entry.done && styles.checkBoxDone,
                          ]}
                        >
                          {entry.done && (
                            <Check size={16} color={colors.white} strokeWidth={3} />
                          )}
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </Card>
              );
            })}

            <GradientButton
              title="Registrar entrenamiento"
              onPress={onSubmit}
              loading={logging}
              style={styles.submit}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: {
      fontFamily: typography.headingXS.fontFamily,
      fontSize: typography.headingXS.fontSize,
      color: colors.textPrimary,
    },
    content: { padding: spacing.xl, gap: 6 },
    sectionLabel: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      letterSpacing: 1.5,
      color: colors.textMuted,
    },
    title: {
      fontFamily: typography.titleL.fontFamily,
      fontSize: typography.titleL.fontSize,
      color: colors.textPrimary,
      lineHeight: 38,
      marginBottom: 12,
    },
    restCard: { padding: 24, alignItems: 'center', gap: 8, marginTop: 8 },
    restTitle: {
      fontFamily: typography.headingS.fontFamily,
      fontSize: typography.headingS.fontSize,
      color: colors.textPrimary,
    },
    restDesc: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textMuted,
      textAlign: 'center',
    },
    dayHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 4,
    },
    routineName: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
    },
    dayLabel: {
      fontFamily: typography.headingM.fontFamily,
      fontSize: typography.headingM.fontSize,
      color: colors.textPrimary,
    },
    weekLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: colors.surface,
    },
    weekLinkText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: 12,
      color: colors.primaryRed,
    },
    progress: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.primaryRed,
      marginBottom: 8,
    },
    exCard: { padding: 16, gap: 10, marginBottom: 4 },
    exHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    exName: {
      fontFamily: typography.headingXS.fontFamily,
      fontSize: typography.headingXS.fontSize,
      color: colors.textPrimary,
    },
    exPrescription: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    exNotes: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    setsHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 4 },
    setsHeaderText: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      letterSpacing: 1,
      color: colors.textMuted,
      textAlign: 'center',
    },
    colSet: { width: 48, textAlign: 'center' },
    colInput: { flex: 1, paddingHorizontal: 4 },
    colCheck: { width: 48, alignItems: 'center' },
    setRow: { flexDirection: 'row', alignItems: 'center' },
    setNumber: {
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textPrimary,
    },
    setInput: {
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.inputBgAlt,
      textAlign: 'center',
      color: colors.textPrimary,
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
    },
    checkBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.divider,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBoxDone: {
      backgroundColor: colors.badgeActive,
      borderColor: colors.badgeActive,
    },
    submit: { marginTop: 16 },
  });
