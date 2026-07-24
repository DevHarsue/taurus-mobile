import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Trash2, X } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { EmptyState } from '@components/EmptyState';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { useToast } from '@hooks/useToast';
import { useTheme } from '@hooks/useTheme';
import { newTempId } from '@offline';
import { useExercises } from '../hooks/useExercises';
import {
  useRoutine,
  useCreateRoutine,
  useUpdateRoutine,
} from '../hooks/useRoutines';
import {
  LEVEL_LABELS,
  MEASUREMENT_TYPES,
  MEASUREMENT_LABELS,
  type CreateRoutineRequest,
  type MeasurementType,
  type RoutineLevel,
} from '@app-types/routine';
import { typography, spacing, type Colors } from '@theme/index';
import type {
  RoutineBuilderScreenProps,
  RoutinesStackParamList,
} from '@navigation/types';

interface BuilderExercise {
  key: string;
  exerciseId?: string;
  exerciseName: string;
  measurementType: MeasurementType;
  sets: string;
  reps: string;
  durationSeconds: string;
  distance: string;
  restSeconds: string;
}

interface BuilderDay {
  key: string;
  label: string;
  exercises: BuilderExercise[];
}

const LEVELS: RoutineLevel[] = ['beginner', 'intermediate', 'advanced'];

function emptyExercise(
  name = '',
  exerciseId?: string,
  measurementType: MeasurementType = 'weight_reps',
): BuilderExercise {
  return {
    key: newTempId(),
    exerciseId,
    exerciseName: name,
    measurementType,
    sets: '3',
    reps: '10',
    durationSeconds: '',
    distance: '',
    restSeconds: '',
  };
}

export default function RoutineBuilderScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RoutinesStackParamList>>();
  const route = useRoute<RoutineBuilderScreenProps['route']>();
  const routineId = route.params?.routineId;
  const isEdit = !!routineId;

  const detailQuery = useRoutine(routineId ?? '', isEdit);
  const { mutate: createRoutine, loading: creating } = useCreateRoutine();
  const { mutate: updateRoutine, loading: updating } = useUpdateRoutine();
  const exercisesQuery = useExercises();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [level, setLevel] = useState<RoutineLevel>('beginner');
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<BuilderDay[]>([
    { key: newTempId(), label: 'Día A', exercises: [] },
  ]);
  const [pickerDayKey, setPickerDayKey] = useState<string | null>(null);

  const hydrated = useRef(false);
  useEffect(() => {
    if (!isEdit || hydrated.current || !detailQuery.data) return;
    const d = detailQuery.data;
    hydrated.current = true;
    setName(d.name);
    setLevel((d.level as RoutineLevel) ?? 'beginner');
    setGoal(d.goal ?? '');
    setDescription(d.description ?? '');
    setDays(
      d.days.map((day) => ({
        key: newTempId(),
        label: day.label,
        exercises: day.exercises.map((ex) => ({
          key: newTempId(),
          exerciseId: ex.exerciseId ?? undefined,
          exerciseName: ex.exerciseName,
          measurementType: ex.measurementType,
          sets: String(ex.sets),
          reps: ex.reps,
          durationSeconds:
            ex.durationSeconds != null ? String(ex.durationSeconds) : '',
          distance: ex.distance ?? '',
          restSeconds: ex.restSeconds != null ? String(ex.restSeconds) : '',
        })),
      })),
    );
  }, [isEdit, detailQuery.data]);

  const addDay = () => {
    const letter = String.fromCharCode(65 + days.length);
    setDays((prev) => [
      ...prev,
      { key: newTempId(), label: `Día ${letter}`, exercises: [] },
    ]);
  };

  const removeDay = (dayKey: string) =>
    setDays((prev) => prev.filter((d) => d.key !== dayKey));

  const setDayLabel = (dayKey: string, label: string) =>
    setDays((prev) => prev.map((d) => (d.key === dayKey ? { ...d, label } : d)));

  const addExerciseToDay = (
    dayKey: string,
    exName?: string,
    exerciseId?: string,
    measurementType?: MeasurementType,
  ) =>
    setDays((prev) =>
      prev.map((d) =>
        d.key === dayKey
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                emptyExercise(exName, exerciseId, measurementType),
              ],
            }
          : d,
      ),
    );

  const updateExercise = (
    dayKey: string,
    exKey: string,
    patch: Partial<BuilderExercise>,
  ) =>
    setDays((prev) =>
      prev.map((d) =>
        d.key === dayKey
          ? {
              ...d,
              exercises: d.exercises.map((ex) =>
                ex.key === exKey ? { ...ex, ...patch } : ex,
              ),
            }
          : d,
      ),
    );

  const removeExercise = (dayKey: string, exKey: string) =>
    setDays((prev) =>
      prev.map((d) =>
        d.key === dayKey
          ? { ...d, exercises: d.exercises.filter((ex) => ex.key !== exKey) }
          : d,
      ),
    );

  const buildPayload = (): CreateRoutineRequest | null => {
    if (name.trim().length < 2) {
      toast.error('La rutina necesita un nombre');
      return null;
    }
    const cleanedDays = days
      .map((d, i) => ({
        label: d.label.trim() || `Día ${i + 1}`,
        orderIndex: i,
        exercises: d.exercises
          .filter((ex) => ex.exerciseName.trim().length > 0)
          .map((ex, j) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName.trim(),
            measurementType: ex.measurementType,
            orderIndex: j,
            sets: Number(ex.sets) || 1,
            reps: ex.reps.trim() || '10',
            durationSeconds:
              ex.measurementType === 'time' && ex.durationSeconds
                ? Number(ex.durationSeconds)
                : undefined,
            distance:
              ex.measurementType === 'distance' && ex.distance.trim()
                ? ex.distance.trim()
                : undefined,
            restSeconds: ex.restSeconds ? Number(ex.restSeconds) : undefined,
          })),
      }))
      .filter((d) => d.exercises.length > 0);

    if (cleanedDays.length === 0) {
      toast.error('Agrega al menos un día con ejercicios');
      return null;
    }
    return {
      name: name.trim(),
      level,
      goal: goal.trim() || undefined,
      description: description.trim() || undefined,
      days: cleanedDays,
    };
  };

  const onSubmit = async () => {
    const payload = buildPayload();
    if (!payload) return;
    let queued = false;
    if (isEdit && routineId) {
      const res = await updateRoutine({ routineId, body: payload });
      queued = res.queued;
    } else {
      const res = await createRoutine(payload);
      queued = res.queued;
    }
    toast[queued ? 'info' : 'success'](
      queued
        ? 'Sin conexión: se guardará al sincronizar'
        : isEdit
          ? 'Rutina actualizada'
          : 'Rutina creada',
    );
    nav.goBack();
  };

  if (isEdit && detailQuery.loading && !detailQuery.data) {
    return <LoadingSpinner />;
  }

  const pickerDay = days.find((d) => d.key === pickerDayKey) ?? null;

  // Etiqueta y binding del campo variable según el tipo de medición.
  const field2 = (ex: BuilderExercise) => {
    switch (ex.measurementType) {
      case 'time':
        return { label: 'TIEMPO (S)', value: ex.durationSeconds, key: 'durationSeconds' as const, numeric: true };
      case 'distance':
        return { label: 'DIST', value: ex.distance, key: 'distance' as const, numeric: false };
      default:
        return { label: 'REPS', value: ex.reps, key: 'reps' as const, numeric: false };
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isEdit ? 'Editar rutina' : 'Nueva rutina'}
        onBack={() => nav.goBack()}
        backgroundColor={colors.backgroundForm}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="NOMBRE DE LA RUTINA"
          placeholder="Ej. Full Body Principiante"
          value={name}
          onChangeText={setName}
          variant="dark"
        />

        <Text style={styles.fieldLabel}>NIVEL</Text>
        <View style={styles.chipsRow}>
          {LEVELS.map((lv) => (
            <Pressable
              key={lv}
              style={[styles.chip, level === lv && styles.chipActive]}
              onPress={() => setLevel(lv)}
            >
              <Text style={[styles.chipText, level === lv && styles.chipTextActive]}>
                {LEVEL_LABELS[lv]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="OBJETIVO (OPCIONAL)"
          placeholder="Ej. Hipertrofia"
          value={goal}
          onChangeText={setGoal}
          variant="dark"
        />
        <Input
          label="DESCRIPCIÓN (OPCIONAL)"
          placeholder="Notas generales de la rutina"
          value={description}
          onChangeText={setDescription}
          variant="dark"
          multiline
        />

        <View style={styles.daysHeader}>
          <Text style={styles.sectionTitle}>Días</Text>
          <Pressable style={styles.addDayBtn} onPress={addDay}>
            <Plus size={16} color={colors.primaryRed} strokeWidth={2.4} />
            <Text style={styles.addDayText}>Día</Text>
          </Pressable>
        </View>

        {days.map((day, dayIdx) => (
          <Card key={day.key} style={styles.dayCard}>
            <View style={styles.dayTop}>
              <View style={styles.dayLabelWrap}>
                <Input
                  label={`DÍA ${dayIdx + 1}`}
                  placeholder="Ej. Día A - Empuje"
                  value={day.label}
                  onChangeText={(t) => setDayLabel(day.key, t)}
                  variant="dark"
                />
              </View>
              {days.length > 1 && (
                <Pressable
                  onPress={() => removeDay(day.key)}
                  hitSlop={8}
                  style={styles.removeDay}
                >
                  <Trash2 size={18} color={colors.badgeExpired} />
                </Pressable>
              )}
            </View>

            {day.exercises.length === 0 && (
              <Text style={styles.noExercises}>Sin ejercicios aún</Text>
            )}

            {day.exercises.map((ex) => {
              const f2 = field2(ex);
              return (
                <View key={ex.key} style={styles.exerciseRow}>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exNameWrap}>
                      <Input
                        label="EJERCICIO"
                        placeholder="Nombre"
                        value={ex.exerciseName}
                        onChangeText={(t) =>
                          updateExercise(day.key, ex.key, { exerciseName: t })
                        }
                        variant="dark"
                      />
                    </View>
                    <Pressable
                      onPress={() => removeExercise(day.key, ex.key)}
                      hitSlop={8}
                      style={styles.removeEx}
                    >
                      <X size={16} color={colors.textMuted} />
                    </Pressable>
                  </View>

                  {/* Tipo de medición */}
                  <View style={styles.measureRow}>
                    {MEASUREMENT_TYPES.map((mt) => (
                      <Pressable
                        key={mt}
                        style={[
                          styles.measureChip,
                          ex.measurementType === mt && styles.measureChipActive,
                        ]}
                        onPress={() =>
                          updateExercise(day.key, ex.key, { measurementType: mt })
                        }
                      >
                        <Text
                          style={[
                            styles.measureChipText,
                            ex.measurementType === mt &&
                              styles.measureChipTextActive,
                          ]}
                        >
                          {MEASUREMENT_LABELS[mt]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.exFields}>
                    <View style={styles.exFieldSm}>
                      <Input
                        label="SERIES"
                        placeholder="3"
                        value={ex.sets}
                        onChangeText={(t) =>
                          updateExercise(day.key, ex.key, { sets: t })
                        }
                        variant="dark"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.exFieldSm}>
                      <Input
                        label={f2.label}
                        placeholder={ex.measurementType === 'distance' ? '5 km' : '10'}
                        value={f2.value}
                        onChangeText={(t) =>
                          updateExercise(day.key, ex.key, { [f2.key]: t })
                        }
                        variant="dark"
                        keyboardType={f2.numeric ? 'numeric' : 'default'}
                      />
                    </View>
                    <View style={styles.exFieldSm}>
                      <Input
                        label="DESC. (S)"
                        placeholder="90"
                        value={ex.restSeconds}
                        onChangeText={(t) =>
                          updateExercise(day.key, ex.key, { restSeconds: t })
                        }
                        variant="dark"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.addExerciseRow}>
              <Pressable
                style={styles.addExerciseBtn}
                onPress={() => setPickerDayKey(day.key)}
              >
                <Plus size={16} color={colors.textPrimary} strokeWidth={2.2} />
                <Text style={styles.addExerciseText}>Desde catálogo</Text>
              </Pressable>
              <Pressable
                style={styles.addExerciseBtn}
                onPress={() => addExerciseToDay(day.key)}
              >
                <Plus size={16} color={colors.textPrimary} strokeWidth={2.2} />
                <Text style={styles.addExerciseText}>Manual</Text>
              </Pressable>
            </View>
          </Card>
        ))}

        <GradientButton
          title={isEdit ? 'Guardar cambios' : 'Crear rutina'}
          onPress={onSubmit}
          loading={creating || updating}
          style={styles.submit}
        />
      </ScrollView>

      <Modal
        visible={!!pickerDay}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerDayKey(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Elegir ejercicio</Text>
              <Pressable onPress={() => setPickerDayKey(null)} hitSlop={8}>
                <X size={22} color={colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {(exercisesQuery.data ?? []).length === 0 ? (
                <EmptyState
                  title="Catálogo vacío"
                  description="Agrega ejercicios al catálogo primero"
                />
              ) : (
                (exercisesQuery.data ?? []).map((ex) => (
                  <Pressable
                    key={ex.id}
                    style={styles.modalItem}
                    onPress={() => {
                      if (pickerDayKey) {
                        addExerciseToDay(
                          pickerDayKey,
                          ex.name,
                          ex.id,
                          ex.measurementType,
                        );
                      }
                      setPickerDayKey(null);
                    }}
                  >
                    <Text style={styles.modalItemName}>{ex.name}</Text>
                    <Text style={styles.modalItemMeta}>
                      {[MEASUREMENT_LABELS[ex.measurementType], ex.muscleGroup]
                        .filter(Boolean)
                        .join('  ·  ')}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundForm },
    content: { padding: spacing.xl, gap: 6, paddingBottom: 48 },
    fieldLabel: {
      fontFamily: typography.labelL.fontFamily,
      fontSize: typography.labelL.fontSize,
      letterSpacing: 1,
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: 6,
      marginTop: 4,
    },
    chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    chip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.divider,
      alignItems: 'center',
    },
    chipActive: { backgroundColor: colors.primaryRed, borderColor: colors.primaryRed },
    chipText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: 13,
      color: colors.textPrimary,
    },
    chipTextActive: { color: colors.white },
    daysHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      marginBottom: 4,
    },
    sectionTitle: {
      fontFamily: typography.headingS.fontFamily,
      fontSize: typography.headingS.fontSize,
      color: colors.textPrimary,
    },
    addDayBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: colors.surface,
    },
    addDayText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: 13,
      color: colors.primaryRed,
    },
    dayCard: { padding: 14, gap: 8, marginTop: 8 },
    dayTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    dayLabelWrap: { flex: 1 },
    removeDay: { paddingTop: 28 },
    noExercises: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
      fontStyle: 'italic',
      paddingVertical: 4,
    },
    exerciseRow: {
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 8,
      gap: 4,
    },
    exerciseHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    exNameWrap: { flex: 1 },
    removeEx: { paddingTop: 28 },
    measureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
    measureChip: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    measureChipActive: {
      backgroundColor: colors.primaryRed,
      borderColor: colors.primaryRed,
    },
    measureChipText: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 11,
      color: colors.textPrimary,
    },
    measureChipTextActive: { color: colors.white },
    exFields: { flexDirection: 'row', gap: 8 },
    exFieldSm: { flex: 1 },
    addExerciseRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    addExerciseBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.divider,
      borderStyle: 'dashed',
    },
    addExerciseText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: 13,
      color: colors.textPrimary,
    },
    submit: { marginTop: 20 },
    modalOverlay: {
      flex: 1,
      backgroundColor: '#00000066',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    modalTitle: {
      fontFamily: typography.headingS.fontFamily,
      fontSize: typography.headingS.fontSize,
      color: colors.textPrimary,
    },
    modalList: { flexGrow: 0 },
    modalItem: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    modalItemName: {
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textPrimary,
    },
    modalItemMeta: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
  });
