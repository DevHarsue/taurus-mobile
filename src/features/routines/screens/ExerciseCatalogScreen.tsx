import React, { useCallback, useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dumbbell, Trash2 } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card } from '@components/Card';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { EmptyState } from '@components/EmptyState';
import { QueryRenderer } from '@components/QueryRenderer';
import { SkeletonCard, SkeletonList } from '@components/Skeleton';
import { useToast } from '@hooks/useToast';
import { useConfirm } from '@hooks/useConfirm';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import {
  useExercises,
  useCreateExercise,
  useDeleteExercise,
} from '../hooks/useExercises';
import {
  exerciseSchema,
  type ExerciseFormValues,
} from '../schemas/routine.schema';
import { typography, spacing, type Colors } from '@theme/index';

export default function ExerciseCatalogScreen() {
  const nav = useNavigation();
  const query = useExercises();
  const { mutate: createExercise, loading: creating } = useCreateExercise();
  const { mutate: deleteExercise } = useDeleteExercise();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: '', muscleGroup: '', equipment: '', description: '' },
  });

  const onSubmit = async (values: ExerciseFormValues) => {
    const { queued } = await createExercise({
      name: values.name,
      muscleGroup: values.muscleGroup || undefined,
      equipment: values.equipment || undefined,
      description: values.description || undefined,
    });
    reset({ name: '', muscleGroup: '', equipment: '', description: '' });
    query.refetch();
    toast[queued ? 'info' : 'success'](
      queued ? 'Sin conexión: se guardará al sincronizar' : 'Ejercicio creado',
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

      <ScrollView
        contentContainerStyle={styles.content}
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
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Nuevo ejercicio</Text>
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
          <GradientButton
            title="Agregar al catálogo"
            onPress={handleSubmit(onSubmit)}
            loading={creating}
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
                <Card key={ex.id} style={styles.row}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{ex.name}</Text>
                    <Text style={styles.rowMeta}>
                      {[ex.muscleGroup, ex.equipment]
                        .filter(Boolean)
                        .join('  ·  ') || 'Sin categoría'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDelete(ex.id, ex.name)}
                    hitSlop={8}
                  >
                    <Trash2 size={18} color={colors.badgeExpired} />
                  </Pressable>
                </Card>
              ))}
            </View>
          )}
        </QueryRenderer>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundForm },
    content: { padding: spacing.xl, gap: 12, paddingBottom: 48 },
    formCard: { padding: 16, gap: 4 },
    formTitle: {
      fontFamily: typography.headingS.fontFamily,
      fontSize: typography.headingS.fontSize,
      color: colors.textPrimary,
      marginBottom: 8,
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
  });
