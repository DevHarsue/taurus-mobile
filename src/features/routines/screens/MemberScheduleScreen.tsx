import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Coffee, Pencil, X } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { GradientButton } from '@components/GradientButton';
import { EmptyState } from '@components/EmptyState';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { routinesService } from '@api/services';
import { useToast } from '@hooks/useToast';
import { useTheme } from '@hooks/useTheme';
import { useRoutines } from '../hooks/useRoutines';
import {
  useMemberSchedule,
  useSetMemberSchedule,
} from '../hooks/useRoutines';
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  type RoutineDetail,
  type ScheduleEntry,
  type Weekday,
} from '@app-types/routine';
import { typography, spacing, type Colors } from '@theme/index';
import type { MemberScheduleScreenProps } from '@navigation/types';

interface DaySelection {
  routineId: string;
  routineName: string;
  routineDayId: string;
  dayLabel: string;
}

type WorkingSchedule = Partial<Record<Weekday, DaySelection>>;

export default function MemberScheduleScreen() {
  const nav = useNavigation();
  const route = useRoute<MemberScheduleScreenProps['route']>();
  const { memberId, memberName } = route.params;

  const scheduleQuery = useMemberSchedule(memberId);
  const routinesQuery = useRoutines();
  const { mutate: saveSchedule, loading: saving } = useSetMemberSchedule();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [schedule, setSchedule] = useState<WorkingSchedule>({});
  const [editingWeekday, setEditingWeekday] = useState<Weekday | null>(null);
  const [pickedRoutine, setPickedRoutine] = useState<RoutineDetail | null>(null);
  const [loadingRoutine, setLoadingRoutine] = useState(false);

  // Precargar el horario actual.
  const hydrated = React.useRef(false);
  useEffect(() => {
    if (hydrated.current || !Array.isArray(scheduleQuery.data)) return;
    hydrated.current = true;
    const initial: WorkingSchedule = {};
    for (const s of scheduleQuery.data) {
      initial[s.weekday] = {
        routineId: s.routineId,
        routineName: s.routineName,
        routineDayId: s.routineDayId,
        dayLabel: s.dayLabel,
      };
    }
    setSchedule(initial);
  }, [scheduleQuery.data]);

  const openEditor = (weekday: Weekday) => {
    setEditingWeekday(weekday);
    setPickedRoutine(null);
  };

  const pickRoutine = async (routineId: string) => {
    setLoadingRoutine(true);
    try {
      const detail = await routinesService.getRoutine(routineId);
      setPickedRoutine(detail);
    } catch {
      toast.error('No se pudo cargar la rutina');
    } finally {
      setLoadingRoutine(false);
    }
  };

  const chooseDay = (routine: RoutineDetail, dayId: string, dayLabel: string) => {
    if (!editingWeekday) return;
    setSchedule((prev) => ({
      ...prev,
      [editingWeekday]: {
        routineId: routine.id,
        routineName: routine.name,
        routineDayId: dayId,
        dayLabel,
      },
    }));
    closeEditor();
  };

  const setRest = () => {
    if (!editingWeekday) return;
    setSchedule((prev) => {
      const next = { ...prev };
      delete next[editingWeekday];
      return next;
    });
    closeEditor();
  };

  const closeEditor = () => {
    setEditingWeekday(null);
    setPickedRoutine(null);
  };

  const onSave = async () => {
    const entries: ScheduleEntry[] = WEEKDAYS.filter(
      (w) => schedule[w],
    ).map((w) => ({
      weekday: w,
      routineId: schedule[w]!.routineId,
      routineDayId: schedule[w]!.routineDayId,
    }));
    const { queued } = await saveSchedule({ memberId, body: { entries } });
    scheduleQuery.refetch();
    toast[queued ? 'info' : 'success'](
      queued
        ? 'Sin conexión: se guardará al sincronizar'
        : 'Horario actualizado',
    );
    nav.goBack();
  };

  if (scheduleQuery.loading && !scheduleQuery.data) return <LoadingSpinner />;

  const assignedCount = WEEKDAYS.filter((w) => schedule[w]).length;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Horario semanal"
        onBack={() => nav.goBack()}
        backgroundColor={colors.backgroundForm}
      />

      <KeyboardScreen contentContainerStyle={styles.content}>
        {!!memberName && <Text style={styles.memberName}>{memberName}</Text>}
        <Text style={styles.hint}>
          Toca cada día para asignarle una rutina y su día, o déjalo en descanso.
          Puedes usar rutinas distintas por día.
        </Text>

        {WEEKDAYS.map((weekday) => {
          const sel = schedule[weekday];
          return (
            <Pressable key={weekday} onPress={() => openEditor(weekday)}>
              <Card style={styles.dayCard}>
                <View style={styles.dayRow}>
                  <Text style={styles.weekdayLabel}>
                    {WEEKDAY_LABELS[weekday]}
                  </Text>
                  <Pencil size={16} color={colors.textMuted} />
                </View>
                {sel ? (
                  <>
                    <Text style={styles.routineName}>{sel.routineName}</Text>
                    <Text style={styles.dayLabel}>{sel.dayLabel}</Text>
                  </>
                ) : (
                  <View style={styles.restRow}>
                    <Coffee size={15} color={colors.textMuted} />
                    <Text style={styles.restText}>Descanso</Text>
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}

        <GradientButton
          title={`Guardar horario (${assignedCount} día${assignedCount === 1 ? '' : 's'})`}
          onPress={onSave}
          loading={saving}
          style={styles.submit}
        />
      </KeyboardScreen>

      {/* Editor de un día */}
      <Modal
        visible={!!editingWeekday}
        transparent
        animationType="slide"
        onRequestClose={closeEditor}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingWeekday ? WEEKDAY_LABELS[editingWeekday] : ''}
              </Text>
              <Pressable onPress={closeEditor} hitSlop={8}>
                <X size={22} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Pressable style={styles.restOption} onPress={setRest}>
              <Coffee size={16} color={colors.primaryRed} />
              <Text style={styles.restOptionText}>Descanso (sin rutina)</Text>
            </Pressable>

            <ScrollView style={styles.modalList}>
              {!pickedRoutine ? (
                <>
                  <Text style={styles.modalSection}>ELIGE UNA RUTINA</Text>
                  {(routinesQuery.data ?? []).length === 0 ? (
                    <EmptyState
                      title="No hay rutinas"
                      description="Crea una rutina primero en la pestaña Rutinas"
                    />
                  ) : (
                    (routinesQuery.data ?? []).map((r) => (
                      <Pressable
                        key={r.id}
                        style={styles.modalItem}
                        onPress={() => pickRoutine(r.id)}
                      >
                        <Text style={styles.modalItemName}>{r.name}</Text>
                        {!!r.goal && (
                          <Text style={styles.modalItemMeta}>{r.goal}</Text>
                        )}
                      </Pressable>
                    ))
                  )}
                  {loadingRoutine && (
                    <Text style={styles.loadingText}>Cargando rutina…</Text>
                  )}
                </>
              ) : (
                <>
                  <Pressable
                    onPress={() => setPickedRoutine(null)}
                    style={styles.backLink}
                  >
                    <Text style={styles.backLinkText}>‹ Cambiar rutina</Text>
                  </Pressable>
                  <Text style={styles.modalSection}>
                    DÍA DE “{pickedRoutine.name}”
                  </Text>
                  {pickedRoutine.days.map((d) => (
                    <Pressable
                      key={d.id}
                      style={styles.modalItem}
                      onPress={() => chooseDay(pickedRoutine, d.id, d.label)}
                    >
                      <Text style={styles.modalItemName}>{d.label}</Text>
                      <Text style={styles.modalItemMeta}>
                        {d.exercises.length} ejercicios
                      </Text>
                    </Pressable>
                  ))}
                </>
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
    content: { padding: spacing.xl, gap: 10, paddingBottom: 48 },
    memberName: {
      fontFamily: typography.titleS.fontFamily,
      fontSize: typography.titleS.fontSize,
      color: colors.textPrimary,
    },
    hint: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textMuted,
      lineHeight: 20,
      marginBottom: 4,
    },
    dayCard: { padding: 16, gap: 4 },
    dayRow: {
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
    routineName: {
      fontFamily: typography.headingXS.fontFamily,
      fontSize: typography.headingXS.fontSize,
      color: colors.textPrimary,
    },
    dayLabel: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.primaryRed,
    },
    restRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    restText: {
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textMuted,
    },
    submit: { marginTop: 16 },
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
      maxHeight: '75%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    modalTitle: {
      fontFamily: typography.headingS.fontFamily,
      fontSize: typography.headingS.fontSize,
      color: colors.textPrimary,
    },
    restOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      marginBottom: 8,
    },
    restOptionText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.textPrimary,
    },
    modalList: { flexGrow: 0 },
    modalSection: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      letterSpacing: 1.5,
      color: colors.textMuted,
      marginVertical: 8,
    },
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
    backLink: { paddingVertical: 8 },
    backLinkText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.primaryRed,
    },
    loadingText: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
      paddingVertical: 8,
    },
  });
