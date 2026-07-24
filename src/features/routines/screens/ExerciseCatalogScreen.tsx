import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dumbbell, Info, Pencil, Trash2 } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { EmptyState } from '@components/EmptyState';
import { QueryRenderer } from '@components/QueryRenderer';
import { KeyboardScreen } from '@components/KeyboardScreen';
import { SkeletonCard, SkeletonList } from '@components/Skeleton';
import { useToast } from '@hooks/useToast';
import { useConfirm } from '@hooks/useConfirm';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import {
  useExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
} from '../hooks/useExercises';
import {
  exerciseSchema,
  type ExerciseFormValues,
} from '../schemas/routine.schema';
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_LABELS,
  MEASUREMENT_DESC,
  type Exercise,
} from '@app-types/routine';
import { typography, spacing, type Colors } from '@theme/index';

const EMPTY_FORM: ExerciseFormValues = {
  name: '',
  muscleGroup: '',
  equipment: '',
  description: '',
  measurementType: 'weight_reps',
};

export default function ExerciseCatalogScreen() {
  const nav = useNavigation();
  const query = useExercises();
  const { mutate: createExercise, loading: creating } = useCreateExercise();
  const { mutate: updateExercise, loading: updating } = useUpdateExercise();
  const { mutate: deleteExercise } = useDeleteExercise();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: EMPTY_FORM,
  });

  const startEdit = (ex: Exercise) => {
    setEditingId(ex.id);
    reset({
      name: ex.name,
      muscleGroup: ex.muscleGroup ?? '',
      equipment: ex.equipment ?? '',
      description: ex.description ?? '',
      measurementType: ex.measurementType,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset(EMPTY_FORM);
  };

  const onSubmit = async (values: ExerciseFormValues) => {
    const body = {
      name: values.name,
      muscleGroup: values.muscleGroup || undefined,
      equipment: values.equipment || undefined,
      description: values.description || undefined,
      measurementType: values.measurementType,
    };
    let queued = false;
    if (editingId) {
      const res = await updateExercise({ exerciseId: editingId, body });
      queued = res.queued;
    } else {
      const res = await createExercise(body);
      queued = res.queued;
    }
    setEditingId(null);
    reset(EMPTY_FORM);
    query.refetch();
    toast[queued ? 'info' : 'success'](
      queued
        ? 'Sin conexión: se guardará al sincronizar'
        : editingId
          ? 'Ejercicio actualizado'
          : 'Ejercicio creado',
    );
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Eliminar ejercicio',
      message: `¿Eliminar "${name}" del catálogo?`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      destructive: true,
    });
    if (!ok) return;
    if (editingId === id) cancelEdit();
    await deleteExercise(id);
    query.refetch();
    toast.success('Ejercicio eliminado');
  };

  const refresh = useCallback(() => {
    haptics.light();
    query.refetch();
  }, [query]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Catálogo de ejercicios"
        onBack={() => nav.goBack()}
        backgroundColor={colors.backgroundForm}
      />

      <KeyboardScreen
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.loading}
            onRefresh={refresh}
            tintColor={colors.primaryRed}
            colors={[colors.primaryRed]}
          />
        }
      >
        <Card style={[styles.formCard, !!editingId && styles.formCardEditing]}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              {editingId ? 'Editar ejercicio' : 'Nuevo ejercicio'}
            </Text>
            {!!editingId && (
              <Pressable onPress={cancelEdit} hitSlop={8}>
                <Text style={styles.cancelLink}>Cancelar</Text>
              </Pressable>
            )}
          </View>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="NOMBRE"
                placeholder="Ej. Press de banca"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                variant="dark"
              />
            )}
          />
          <Controller
            control={control}
            name="muscleGroup"
            render={({ field: { onChange, value } }) => (
              <Input
                label="GRUPO MUSCULAR"
                placeholder="Ej. Pecho"
                value={value ?? ''}
                onChangeText={onChange}
                variant="dark"
              />
            )}
          />
          <Controller
            control={control}
            name="equipment"
            render={({ field: { onChange, value } }) => (
              <Input
                label="EQUIPO"
                placeholder="Ej. Barra"
                value={value ?? ''}
                onChangeText={onChange}
                variant="dark"
              />
            )}
          />
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>TIPO DE MEDICIÓN</Text>
            <Info size={13} color={colors.textMuted} />
          </View>
          <Controller
            control={control}
            name="measurementType"
            render={({ field: { onChange, value } }) => (
              <>
                <View style={styles.measureRow}>
                  {MEASUREMENT_TYPES.map((mt) => (
                    <Pressable
                      key={mt}
                      style={[
                        styles.measureChip,
                        value === mt && styles.measureChipActive,
                      ]}
                      onPress={() => onChange(mt)}
                    >
                      <Text
                        style={[
                          styles.measureChipText,
                          value === mt && styles.measureChipTextActive,
                        ]}
                      >
                        {MEASUREMENT_LABELS[mt]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.measureHelp}>{MEASUREMENT_DESC[value]}</Text>
              </>
            )}
          />
          <GradientButton
            title={editingId ? 'Guardar cambios' : 'Agregar al catálogo'}
            onPress={handleSubmit(onSubmit)}
            loading={creating || updating}
          />
        </Card>

        <Text style={styles.listTitle}>Ejercicios</Text>

        <QueryRenderer
          query={query}
          isEmpty={(d) => d.length === 0}
          skeleton={
            <SkeletonList
              count={4}
              renderItem={() => <SkeletonCard height={64} />}
            />
          }
          empty={
            <EmptyState
              icon={Dumbbell}
              title="Catálogo vacío"
              description="Agrega ejercicios para construir tus rutinas"
            />
          }
        >
          {(exercises) => (
            <View style={styles.list}>
              {exercises.map((ex) => (
                <Card
                  key={ex.id}
                  style={[styles.row, editingId === ex.id && styles.rowEditing]}
                >
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{ex.name}</Text>
                    <Text style={styles.rowMeta}>
                      {[
                        MEASUREMENT_LABELS[ex.measurementType],
                        ex.muscleGroup,
                        ex.equipment,
                      ]
                        .filter(Boolean)
                        .join('  ·  ')}
                    </Text>
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => startEdit(ex)} hitSlop={8}>
                      <Pencil size={17} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(ex.id, ex.name)}
                      hitSlop={8}
                    >
                      <Trash2 size={17} color={colors.badgeExpired} />
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </QueryRenderer>
      </KeyboardScreen>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundForm },
    content: { padding: spacing.xl, gap: 12, paddingBottom: 48 },
    formCard: { padding: 16, gap: 4 },
    formCardEditing: { borderWidth: 1.5, borderColor: colors.primaryRed },
    formHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    formTitle: {
      fontFamily: typography.headingS.fontFamily,
      fontSize: typography.headingS.fontSize,
      color: colors.textPrimary,
    },
    cancelLink: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.primaryRed,
    },
    fieldLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
      marginTop: 4,
    },
    fieldLabel: {
      fontFamily: typography.labelL.fontFamily,
      fontSize: typography.labelL.fontSize,
      letterSpacing: 1,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    measureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    measureChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    measureChipActive: {
      backgroundColor: colors.primaryRed,
      borderColor: colors.primaryRed,
    },
    measureChipText: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: 13,
      color: colors.textPrimary,
    },
    measureChipTextActive: { color: colors.white },
    measureHelp: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 8,
      marginBottom: 12,
      lineHeight: 16,
    },
    listTitle: {
      fontFamily: typography.labelM.fontFamily,
      fontSize: typography.labelM.fontSize,
      letterSpacing: 1.5,
      color: colors.textMuted,
      marginTop: 8,
    },
    list: { gap: 10 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
    },
    rowEditing: { borderWidth: 1.5, borderColor: colors.primaryRed },
    rowInfo: { flex: 1, gap: 2 },
    rowName: {
      fontFamily: typography.bodyM.fontFamily,
      fontSize: typography.bodyM.fontSize,
      color: colors.textPrimary,
    },
    rowMeta: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 12,
      color: colors.textMuted,
    },
    rowActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  });
