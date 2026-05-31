import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Info, Pencil, Download, Fingerprint } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { CircularProgress } from '@components/CircularProgress';
import { GradientButton } from '@components/GradientButton';
import { QueryRenderer } from '@components/QueryRenderer';
import { Skeleton } from '@components/Skeleton';
import { useMemberDetail } from '../hooks/useMemberDetail';
import { useMemberSubscriptions } from '../hooks/useMemberSubscriptions';
import { useMemberAccessLog } from '../hooks/useMemberAccessLog';
import { useDeleteMember } from '../hooks/useDeleteMember';
import { useGenerateMemberCard } from '../hooks/useGenerateMemberCard';
import { useToast } from '@hooks/useToast';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import { confirmDialog } from '@utils/confirmDialog';
import { calculateDurationDays, formatDateSpanish } from '@utils/dates';
import { typography, spacing, type Colors } from '@theme/index';
import type { MemberDetailScreenProps, MembersStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<MembersStackParamList>;

export default function MemberDetailScreen({ route }: MemberDetailScreenProps) {
  const { id } = route.params;
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const query = useMemberDetail(id);
  const subscriptionsQuery = useMemberSubscriptions(id);
  const accessLogQuery = useMemberAccessLog(id);
  const { mutate: deleteMember } = useDeleteMember();
  const { mutate: generateCard, loading: generatingCard } = useGenerateMemberCard();
  const { toast } = useToast();

  const handleDelete = async () => {
    const ok = await confirmDialog(
      'Eliminar miembro',
      'Esta seguro que desea eliminar este miembro? Esta accion no se puede deshacer.',
      { destructive: true, confirmLabel: 'Eliminar' },
    );
    if (!ok) return;
    await deleteMember(id);
    haptics.warning();
    toast.success('Miembro eliminado');
    nav.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      query.refetch();
      subscriptionsQuery.refetch();
      accessLogQuery.refetch();
    }, [query.refetch, subscriptionsQuery.refetch, accessLogQuery.refetch])
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Expediente"
        onBack={() => nav.goBack()}
        rightIcon={<Info size={20} color={colors.textPrimaryAlpha50} strokeWidth={2} />}
      />

      <QueryRenderer
        query={query}
        emptyTitle="Miembro no encontrado"
        skeleton={
          <View style={styles.scrollContent}>
            <View style={styles.statusRow}>
              <Skeleton width={70} height={20} borderRadius={10} />
              <Skeleton width={80} height={11} borderRadius={5} />
            </View>
            <Skeleton width="70%" height={32} borderRadius={8} style={styles.skelGap} />
            <Skeleton width="50%" height={13} borderRadius={6} />
            <View style={styles.skelProgress}>
              <Skeleton width={140} height={140} borderRadius={70} />
            </View>
            <Skeleton width="100%" height={72} borderRadius={12} />
            <Skeleton width="100%" height={88} borderRadius={12} style={styles.skelGap} />
            <Skeleton width="55%" height={12} borderRadius={6} style={styles.skelGap} />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} width="100%" height={44} borderRadius={8} style={styles.skelGap} />
            ))}
          </View>
        }
      >
        {(member) => {
          const activeSub = subscriptionsQuery.data?.find((s) => s.status === 'active');
          const totalDays = activeSub
            ? calculateDurationDays(activeSub.startsAt, activeSub.expiresAt)
            : 30;
          const progress = Math.max(0, member.daysLeft / totalDays);
          return (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.statusRow}>
                <Badge
                  label={member.subscriptionStatus === 'active' ? 'ACTIVO' : member.subscriptionStatus === 'expired' ? 'VENCIDO' : 'SIN PLAN'}
                  variant={member.subscriptionStatus === 'active' ? 'active' : member.subscriptionStatus === 'expired' ? 'expired' : 'neutral'}
                  badgeStyle="dot"
                />
                <Text style={styles.memberId}>ID: {member.cedula}</Text>
              </View>

              <Text style={styles.memberName}>{member.name.toUpperCase()}</Text>
              {member.createdAt && (
                <Text style={styles.memberSince}>Miembro desde: {formatDateSpanish(member.createdAt)}</Text>
              )}

              <View style={styles.progressContainer}>
                <CircularProgress
                  size={140}
                  strokeWidth={6}
                  progress={progress}
                  color={colors.primaryRed}
                  backgroundColor={colors.divider}
                >
                  <Text style={styles.daysNumber}>{member.daysLeft}</Text>
                  <Text style={styles.daysLabel}>DIAS RESTANTES</Text>
                </CircularProgress>
              </View>

              <Card style={styles.planCard}>
                <Text style={styles.planIcon}>📋</Text>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{member.currentPlanName ?? 'Sin plan'}</Text>
                  <Text style={styles.planDateLabel}>{member.daysLeft} dias restantes</Text>
                </View>
              </Card>

              {(member.email || member.phone) && (
                <Card style={styles.contactCard}>
                  {member.email && (
                    <View style={styles.contactRow}>
                      <Text style={styles.contactLabel}>Email</Text>
                      <Text style={styles.contactValue}>{member.email}</Text>
                    </View>
                  )}
                  {member.phone && (
                    <View style={styles.contactRow}>
                      <Text style={styles.contactLabel}>Telefono</Text>
                      <Text style={styles.contactValue}>{member.phone}</Text>
                    </View>
                  )}
                </Card>
              )}

              <Text style={styles.historyTitle}>HISTORIAL DE SUSCRIPCIONES</Text>

              {subscriptionsQuery.data?.length ? (
                subscriptionsQuery.data.map((sub) => (
                  <View key={sub.id} style={styles.historyRow}>
                    <Text style={styles.historyIcon}>{sub.status === 'active' ? '✓' : '↻'}</Text>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>Suscripcion ({sub.status})</Text>
                      <Text style={styles.historyMeta}>Inicio: {new Date(sub.startsAt).toLocaleDateString('es')}</Text>
                    </View>
                    <Text style={styles.historyDate}>{new Date(sub.expiresAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyHistory}>Sin suscripciones registradas</Text>
              )}

              <Text style={styles.historyTitle}>ULTIMOS ACCESOS</Text>

              {accessLogQuery.data?.length ? (
                accessLogQuery.data.map((entry, index) => (
                  <View key={index} style={styles.historyRow}>
                    <Text style={styles.historyIcon}>
                      {entry.granted ? '✓' : '✕'}
                    </Text>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>
                        {entry.granted ? 'Acceso concedido' : 'Acceso denegado'}
                      </Text>
                      <Text style={styles.historyMeta}>
                        {entry.reason === 'expired'
                          ? 'Suscripcion vencida'
                          : entry.reason === 'not_found'
                            ? 'No encontrado'
                            : 'Activo'}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {new Date(entry.timestamp)
                        .toLocaleDateString('es', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        .toUpperCase()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyHistory}>Sin accesos registrados</Text>
              )}

              <GradientButton
                title="+ Renovar membresia"
                onPress={() => nav.navigate('RenewMembership', { memberId: id, memberName: member.name })}
              />

              <View style={styles.actionRow}>
                <Button
                  variant="outline"
                  title="Editar"
                  icon={<Pencil size={18} color={colors.primaryRed} strokeWidth={2} />}
                  onPress={() => nav.navigate('EditMember', { id })}
                  style={styles.actionBtn}
                />
                <Button
                  variant="outline"
                  title="Carnet"
                  icon={<Download size={18} color={colors.primaryRed} strokeWidth={2} />}
                  onPress={() => {
                    void generateCard(member).catch((e) => {
                      const msg = e instanceof Error ? e.message : 'Error desconocido';
                      toast.error(`No se pudo generar el carnet: ${msg}`);
                    });
                  }}
                  loading={generatingCard}
                  style={styles.actionBtn}
                />
                <Button
                  variant="outline"
                  title="Huella"
                  icon={<Fingerprint size={18} color={colors.primaryRed} strokeWidth={2} />}
                  onPress={() =>
                    nav.navigate('FingerprintEnroll', { memberId: id, memberName: member.name })
                  }
                  style={styles.actionBtn}
                />
              </View>

              <Button
                variant="danger"
                title="Eliminar miembro"
                onPress={handleDelete}
                style={styles.deleteBtn}
              />
            </ScrollView>
          );
        }}
      </QueryRenderer>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xxl, gap: 8 },
  skelGap: { marginTop: 6 },
  skelProgress: { alignItems: 'center', paddingVertical: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberId: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted },
  memberName: { fontFamily: typography.titleM.fontFamily, fontSize: typography.titleM.fontSize, color: colors.textPrimary, lineHeight: 36, marginTop: 4 },
  memberSince: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, marginBottom: 16 },
  progressContainer: { alignItems: 'center', paddingVertical: 16 },
  daysNumber: { fontFamily: typography.statXL.fontFamily, fontSize: typography.statXL.fontSize, color: colors.primaryRed },
  daysLabel: { fontFamily: typography.labelS.fontFamily, fontSize: 8, letterSpacing: 1, color: colors.textMuted },
  planCard: { flexDirection: 'row', gap: 12, padding: 16, alignItems: 'flex-start' },
  planIcon: { fontSize: 20 },
  planInfo: { flex: 1, gap: 8 },
  planName: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
  planDateLabel: { fontFamily: typography.labelS.fontFamily, fontSize: 8, letterSpacing: 0.5, color: colors.textMuted },
  historyTitle: { fontFamily: typography.labelL.fontFamily, fontSize: typography.labelL.fontSize, letterSpacing: 1.5, color: colors.textMuted, marginTop: 16 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  historyIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  historyInfo: { flex: 1, gap: 2 },
  historyName: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
  historyMeta: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted },
  historyDate: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted },
  emptyHistory: { fontFamily: typography.bodySM.fontFamily, fontSize: typography.bodySM.fontSize, color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
  contactCard: { padding: 16, gap: 8 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  contactLabel: { fontFamily: typography.bodyXS.fontFamily, fontSize: 11, color: colors.textMuted },
  contactValue: { fontFamily: typography.bodyS.fontFamily, fontSize: typography.bodyS.fontSize, color: colors.textPrimary },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1 },
  deleteBtn: { marginTop: 16 },
});
