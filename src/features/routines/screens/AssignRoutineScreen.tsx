import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { SearchBar } from '@components/SearchBar';
import { GradientButton } from '@components/GradientButton';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { useQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import { useToast } from '@hooks/useToast';
import { useTheme } from '@hooks/useTheme';
import { useRoutine, useAssignRoutine } from '../hooks/useRoutines';
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  type DayMapping,
  type Weekday,
} from '@app-types/routine';
import type { GetMembersResponse, MemberListItem } from '@app-types/member';
import { typography, spacing, type Colors } from '@theme/index';
import type {
  AssignRoutineScreenProps,
  RoutinesStackParamList,
} from '@navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function AssignRoutineScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RoutinesStackParamList>>();
  const route = useRoute<AssignRoutineScreenProps['route']>();
  const { routineId, routineName } = route.params;

  const routineQuery = useRoutine(routineId);
  const { mutate: assignRoutine, loading: assigning } = useAssignRoutine();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(
    null,
  );
  const [mapping, setMapping] = useState<DayMapping>({});

  const membersQuery = useQuery<GetMembersResponse>({
    queryFn: () =>
      membersService.getAll({ search: search || undefined, limit: 30 }),
    deps: [search],
    errorMessage: 'No se pudo cargar miembros',
  });

  const days = routineQuery.data?.days ?? [];

  const setWeekday = (weekday: Weekday, dayId: string | undefined) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (!dayId) delete next[weekday];
      else next[weekday] = dayId;
      return next;
    });
  };

  const assignedCount = Object.keys(mapping).length;

  const onSubmit = async () => {
    if (!selectedMember) {
      toast.error('Selecciona un miembro');
      return;
    }
    if (assignedCount === 0) {
      toast.error('Asigna al menos un día');
      return;
    }
    const { queued } = await assignRoutine({
      routineId,
      memberId: selectedMember.id,
      dayMapping: mapping,
      startsAt: new Date().toISOString(),
    });
    toast[queued ? 'info' : 'success'](
      queued
        ? 'Sin conexión: se asignará al sincronizar'
        : `Rutina asignada a ${selectedMember.name}`,
    );
    nav.goBack();
  };

  if (routineQuery.loading && !routineQuery.data) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Asignar rutina"
        onBack={() => nav.goBack()}
        backgroundColor={colors.backgroundForm}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.routineName}>{routineName ?? routineQuery.data?.name}</Text>

        {/* Paso 1: miembro */}
        <Text style={styles.stepLabel}>1 · MIEMBRO</Text>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o cédula..."
        />
        <View style={styles.memberList}>
          {(membersQuery.data?.data ?? []).map((m) => {
            const selected = selectedMember?.id === m.id;
            return (
              <Pressable
                key={m.id}
                style={[styles.memberRow, selected && styles.memberRowActive]}
                onPress={() => setSelectedMember(m)}
              >
                <View style={styles.memberInfo}>
                  <Text
                    style={[
                      styles.memberName,
                      selected && styles.memberNameActive,
                    ]}
                  >
                    {m.name}
                  </Text>
                  <Text
                    style={[
                      styles.memberCedula,
                      selected && styles.memberMetaActive,
                    ]}
                  >
                    {m.cedula}
                  </Text>
                </View>
                {selected && <Check size={18} color={colors.white} />}
              </Pressable>
            );
          })}
          {(membersQuery.data?.data ?? []).length === 0 && (
            <Text style={styles.emptyMembers}>Sin resultados</Text>
          )}
        </View>

        {/* Paso 2: días */}
        <Text style={styles.stepLabel}>2 · DÍAS DE LA SEMANA</Text>
        <Text style={styles.hint}>
          Elige qué día de la rutina toca cada día de la semana.
        </Text>

        {days.length === 0 ? (
          <Text style={styles.emptyMembers}>Esta rutina no tiene días.</Text>
        ) : (
          WEEKDAYS.map((weekday) => (
            <Card key={weekday} style={styles.weekdayCard}>
              <Text style={styles.weekdayLabel}>{WEEKDAY_LABELS[weekday]}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayChips}
              >
                <Pressable
                  style={[
                    styles.dayChip,
                    !mapping[weekday] && styles.dayChipActive,
                  ]}
                  onPress={() => setWeekday(weekday, undefined)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      !mapping[weekday] && styles.dayChipTextActive,
                    ]}
                  >
                    Descanso
                  </Text>
                </Pressable>
                {days.map((day) => {
                  const active = mapping[weekday] === day.id;
                  return (
                    <Pressable
                      key={day.id}
                      style={[styles.dayChip, active && styles.dayChipActive]}
                      onPress={() => setWeekday(weekday, day.id)}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          active && styles.dayChipTextActive,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Card>
          ))
        )}

        <GradientButton
          title="Asignar rutina"
          onPress={onSubmit}
          loading={assigning}
          style={styles.submit}
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundForm },
    content: { padding: spacing.xl, gap: 8, paddingBottom: 48 },
    routineName: {
      fontFamily: typography.titleS.fontFamily,
      fontSize: typography.titleS.fontSize,
      color: colors.textPrimary,
      marginBottom: 8,
    },
    stepLabel: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      letterSpacing: 1.5,
      color: colors.textMuted,
      marginTop: 16,
      marginBottom: 8,
    },
    hint: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 8,
    },
    memberList: { gap: 8, marginTop: 8 },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    memberRowActive: { backgroundColor: colors.primaryRed },
    memberInfo: { flex: 1 },
    memberName: {
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textPrimary,
    },
    memberNameActive: { color: colors.white },
    memberCedula: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
    },
    memberMetaActive: { color: '#FFFFFFB0' },
    emptyMembers: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textMuted,
      paddingVertical: 8,
    },
    weekdayCard: { padding: 14, gap: 10, marginBottom: 8 },
    weekdayLabel: {
      fontFamily: typography.headingXS.fontFamily,
      fontSize: typography.headingXS.fontSize,
      color: colors.textPrimary,
    },
    dayChips: { gap: 8, paddingRight: 8 },
    dayChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    dayChipActive: {
      backgroundColor: colors.primaryRed,
      borderColor: colors.primaryRed,
    },
    dayChipText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: 13,
      color: colors.textPrimary,
    },
    dayChipTextActive: { color: colors.white },
    submit: { marginTop: 20 },
  });
