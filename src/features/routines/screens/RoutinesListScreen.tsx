import React, { useCallback, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClipboardList, Dumbbell } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { FAB } from '@components/FAB';
import { QueryRenderer } from '@components/QueryRenderer';
import { EmptyState } from '@components/EmptyState';
import { SkeletonCard, SkeletonList } from '@components/Skeleton';
import { useToast } from '@hooks/useToast';
import { useConfirm } from '@hooks/useConfirm';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import { useRoutines, useDeleteRoutine } from '../hooks/useRoutines';
import { LEVEL_LABELS, type RoutineLevel } from '@app-types/routine';
import { typography, spacing, type Colors } from '@theme/index';
import type { RoutinesStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<RoutinesStackParamList>;

export default function RoutinesListScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const query = useRoutines();
  const { mutate: deleteRoutine } = useDeleteRoutine();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useFocusEffect(
    useCallback(() => {
      query.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Eliminar rutina',
      message: `¿Eliminar la rutina "${name}"?`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      destructive: true,
    });
    if (!ok) return;
    await deleteRoutine(id);
    query.refetch();
    toast.success('Rutina eliminada');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Rutinas"
        rightIcon={<Dumbbell size={20} color={colors.textPrimary} strokeWidth={2} />}
        onRightPress={() => nav.navigate('ExerciseCatalog')}
        backgroundColor={colors.backgroundCard}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
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
        <Text style={styles.title}>Rutinas de entrenamiento</Text>
        <Text style={styles.description}>
          Crea plantillas de rutina. Para asignarlas, entra al detalle de un
          miembro → “Horario semanal” (puedes poner una rutina distinta por día).
        </Text>

        <Pressable
          style={styles.catalogLink}
          onPress={() => nav.navigate('ExerciseCatalog')}
        >
          <Dumbbell size={18} color={colors.primaryRed} strokeWidth={2} />
          <Text style={styles.catalogLinkText}>Gestionar catálogo de ejercicios</Text>
        </Pressable>

        <QueryRenderer
          query={query}
          isEmpty={(d) => d.length === 0}
          skeleton={
            <SkeletonList
              count={3}
              renderItem={() => <SkeletonCard height={120} />}
            />
          }
          empty={
            <EmptyState
              icon={ClipboardList}
              title="No hay rutinas creadas"
              description="Crea tu primera rutina para empezar"
              actionLabel="Crear rutina"
              onAction={() => nav.navigate('RoutineBuilder')}
            />
          }
        >
          {(routines) => (
            <View style={styles.list}>
              {routines.map((routine) => (
                <Card key={routine.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    <Badge
                      label={LEVEL_LABELS[routine.level as RoutineLevel] ?? routine.level}
                      variant="neutral"
                      badgeStyle="pill"
                    />
                  </View>
                  {!!routine.goal && (
                    <Text style={styles.routineGoal}>{routine.goal}</Text>
                  )}
                  {!!routine.description && (
                    <Text style={styles.routineDesc} numberOfLines={2}>
                      {routine.description}
                    </Text>
                  )}
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() =>
                        nav.navigate('RoutineBuilder', { routineId: routine.id })
                      }
                    >
                      <Text style={styles.actionText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => handleDelete(routine.id, routine.name)}
                    >
                      <Text style={styles.deleteText}>Eliminar</Text>
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </QueryRenderer>
      </ScrollView>

      <FAB onPress={() => nav.navigate('RoutineBuilder')} />
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundCard },
    content: { padding: spacing.xl, gap: 8 },
    title: {
      fontFamily: typography.titleS.fontFamily,
      fontSize: typography.titleS.fontSize,
      color: colors.textPrimary,
    },
    description: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textMuted,
      marginBottom: 12,
      lineHeight: 20,
    },
    catalogLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: colors.surface,
      marginBottom: 8,
    },
    catalogLinkText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.textPrimary,
    },
    list: { gap: 14 },
    card: { padding: 18, gap: 8 },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    routineName: {
      flex: 1,
      fontFamily: typography.headingS.fontFamily,
      fontSize: typography.headingS.fontSize,
      color: colors.textPrimary,
    },
    routineGoal: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.primaryRed,
      textTransform: 'capitalize',
    },
    routineDesc: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textMuted,
      lineHeight: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    actionBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.divider,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
    },
    assignBtn: {
      backgroundColor: colors.primaryRed,
      borderColor: colors.primaryRed,
    },
    assignText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: 13,
      color: colors.white,
    },
    actionText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: 13,
      color: colors.textPrimary,
    },
    deleteText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: 13,
      color: colors.badgeExpired,
    },
  });
