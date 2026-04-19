import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenHeader } from '@components/ScreenHeader';
import { Input } from '@components/Input';
import { GradientButton } from '@components/GradientButton';
import { AlertBanner } from '@components/AlertBanner';
import { QueryRenderer } from '@components/QueryRenderer';
import { useMemberDetail } from '../hooks/useMemberDetail';
import { useUpdateMember } from '../hooks/useUpdateMember';
import { updateMemberSchema, type UpdateMemberFormValues } from '../schemas/updateMember.schema';
import { colors, typography, spacing } from '@theme/index';
import type { EditMemberScreenProps } from '@navigation/types';

function EditMemberForm({ id, defaultValues }: { id: string; defaultValues: UpdateMemberFormValues }) {
  const nav = useNavigation();
  const { mutate, loading, error } = useUpdateMember();

  const { control, handleSubmit, formState: { errors } } = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues,
  });

  const onSubmit = async (values: UpdateMemberFormValues) => {
    await mutate({ id, body: values });
    nav.goBack();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Editar Informacion</Text>

      {error && <AlertBanner message={error} variant="error" />}

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input label="NOMBRE COMPLETO" placeholder="Ej. Juan Perez" value={value} onChangeText={onChange} error={errors.name?.message} variant="dark" />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <Input label="TELEFONO" placeholder="+508 0000-0000" value={value ?? ''} onChangeText={onChange} error={errors.phone?.message} variant="dark" keyboardType="phone-pad" />
        )}
      />

      <GradientButton title="Guardar cambios" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}

export default function EditMemberScreen({ route }: EditMemberScreenProps) {
  const { id } = route.params;
  const nav = useNavigation();
  const query = useMemberDetail(id);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Editar Miembro"
        onBack={() => nav.goBack()}
        backgroundColor={colors.backgroundForm}
      />

      <QueryRenderer query={query} emptyTitle="Miembro no encontrado">
        {(member) => (
          <EditMemberForm
            id={id}
            defaultValues={{
              name: member.name,
              phone: member.phone ?? '',
            }}
          />
        )}
      </QueryRenderer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundForm },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xxl, gap: 8 },
  title: { fontFamily: typography.titleS.fontFamily, fontSize: typography.titleS.fontSize, color: colors.textPrimary, marginBottom: 16 },
});
