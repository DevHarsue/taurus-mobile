import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Badge } from '@components/Badge';
import { Card } from '@components/Card';
import { ErrorState } from '@components/ErrorState';
import { Skeleton, SkeletonList } from '@components/Skeleton';
import { useTheme } from '@hooks/useTheme';
import { useToast } from '@hooks/useToast';
import { spacing, typography, type Colors } from '@theme/index';
import { formatFullTimestamp } from '@utils/dates';
import { AuditDiff } from '../components/AuditDiff';
import { useAuditDetail } from '../hooks/useAuditDetail';
import { useExportAuditDetailPdf } from '../hooks/useExportAuditDetailPdf';
import {
  operationDescriptor,
  shortRowId,
  tableLabel,
} from '../utils/auditLabels';
import type { DashboardStackParamList } from '@navigation/types';

type AuditDetailRoute = RouteProp<DashboardStackParamList, 'AuditDetail'>;

const SYSTEM_LABEL = 'Sistema';

function DetailSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.skel}>
      <Skeleton width="50%" height={14} borderRadius={7} />
      <Skeleton width="80%" height={20} borderRadius={10} />
      <Skeleton width="60%" height={14} borderRadius={7} />
      <View style={{ height: spacing.lg }} />
      <SkeletonList
        count={5}
        renderItem={() => (
          <View style={styles.skelRow}>
            <Skeleton width="30%" height={10} borderRadius={5} />
            <Skeleton width="80%" height={14} borderRadius={7} />
          </View>
        )}
      />
    </View>
  );
}

export default function AuditDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<AuditDetailRoute>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = route.params;
  const { data, loading, error, refetch } = useAuditDetail(id);
  const { mutate: exportPdf, loading: exporting } = useExportAuditDetailPdf();
  const { toast } = useToast();

  const handleExport = useCallback(() => {
    if (!data || exporting) return;
    void exportPdf(data).catch(() => {
      toast.error('No se pudo generar el PDF del detalle');
    });
  }, [data, exportPdf, exporting, toast]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Detalle de auditoría"
        onBack={() => nav.goBack()}
        rightIcon={
          data ? (
            exporting ? (
              <ActivityIndicator size="small" color={colors.primaryRed} />
            ) : (
              <FileText size={22} color={colors.textPrimary} strokeWidth={2} />
            )
          ) : undefined
        }
        onRightPress={handleExport}
      />

      {loading && !data ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          <DetailSkeleton />
        </ScrollView>
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : data ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.headerCard}>
            <View style={styles.badgeRow}>
              <Badge
                label={operationDescriptor(data.operation).label}
                variant={operationDescriptor(data.operation).badgeVariant}
                badgeStyle="pill"
              />
              <Text style={styles.table}>
                {tableLabel(data.tableSchema, data.tableName)}
              </Text>
            </View>

            <Text style={styles.actor}>{data.actorEmail ?? SYSTEM_LABEL}</Text>
            <Text style={styles.timestamp}>
              {formatFullTimestamp(data.changedAt)}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>ID de fila</Text>
              <Text style={styles.metaValue}>{shortRowId(data.rowId)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Entrada #</Text>
              <Text style={styles.metaValue}>{data.id}</Text>
            </View>
          </Card>

          <Card style={styles.diffCard}>
            <AuditDiff
              operation={data.operation}
              oldData={data.oldData}
              newData={data.newData}
            />
          </Card>
        </ScrollView>
      ) : null}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, gap: spacing.lg },
    headerCard: { padding: spacing.lg, gap: spacing.sm },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    table: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.textSecondary,
    },
    actor: {
      fontFamily: typography.headingS.fontFamily,
      fontSize: typography.headingS.fontSize,
      color: colors.textPrimary,
      marginTop: spacing.xs,
    },
    timestamp: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textMuted,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: spacing.xs,
    },
    metaLabel: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 11,
      color: colors.textMuted,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    metaValue: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.textPrimary,
    },
    diffCard: { padding: spacing.lg },
    skel: { gap: spacing.sm, padding: spacing.xl },
    skelRow: { paddingVertical: spacing.sm, gap: 6 },
  });
