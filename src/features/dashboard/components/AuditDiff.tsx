import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useTheme } from '@hooks/useTheme';
import { spacing, typography, type Colors } from '@theme/index';
import { fieldLabel, formatAuditValue } from '../utils/auditLabels';
import type { AuditOperation } from '@app-types/audit';

interface Props {
  operation: AuditOperation;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}

interface DiffRow {
  field: string;
  before?: unknown;
  after?: unknown;
  mode: 'created' | 'deleted' | 'changed';
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'object' && typeof b === 'object') {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

function buildRows(
  operation: AuditOperation,
  oldData: Record<string, unknown> | null | undefined,
  newData: Record<string, unknown> | null | undefined,
): DiffRow[] {
  if (operation === 'INSERT') {
    const data = newData ?? {};
    return Object.keys(data).map((field) => ({
      field,
      after: data[field],
      mode: 'created',
    }));
  }
  if (operation === 'DELETE') {
    const data = oldData ?? {};
    return Object.keys(data).map((field) => ({
      field,
      before: data[field],
      mode: 'deleted',
    }));
  }
  // UPDATE: solo campos donde old !== new
  const before = oldData ?? {};
  const after = newData ?? {};
  const fields = new Set<string>([...Object.keys(before), ...Object.keys(after)]);
  const rows: DiffRow[] = [];
  fields.forEach((field) => {
    if (!deepEqual(before[field], after[field])) {
      rows.push({
        field,
        before: before[field],
        after: after[field],
        mode: 'changed',
      });
    }
  });
  return rows;
}

const SECTION_TITLE: Record<AuditOperation, string> = {
  INSERT: 'Campos creados',
  DELETE: 'Campos eliminados',
  UPDATE: 'Campos modificados',
};

export function AuditDiff({ operation, oldData, newData }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const rows = useMemo(
    () => buildRows(operation, oldData, newData),
    [operation, oldData, newData],
  );

  if (rows.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin cambios registrados</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{SECTION_TITLE[operation]}</Text>
      {rows.map((row) => (
        <View key={row.field} style={styles.row}>
          <Text style={styles.field}>{fieldLabel(row.field)}</Text>
          {row.mode === 'changed' ? (
            <View style={styles.changedValueRow}>
              <Text style={[styles.value, styles.beforeValue]} numberOfLines={2}>
                {formatAuditValue(row.before)}
              </Text>
              <ArrowRight size={14} color={colors.textMuted} />
              <Text style={[styles.value, styles.afterValue]} numberOfLines={2}>
                {formatAuditValue(row.after)}
              </Text>
            </View>
          ) : row.mode === 'created' ? (
            <Text style={[styles.value, styles.afterValue]} numberOfLines={3}>
              {formatAuditValue(row.after)}
            </Text>
          ) : (
            <Text style={[styles.value, styles.beforeValue]} numberOfLines={3}>
              {formatAuditValue(row.before)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { gap: spacing.sm },
    sectionTitle: {
      fontFamily: typography.labelL.fontFamily,
      fontSize: typography.labelL.fontSize,
      letterSpacing: 1.5,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    row: {
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      gap: 4,
    },
    field: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 11,
      color: colors.textMuted,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    changedValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    value: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      flexShrink: 1,
    },
    beforeValue: {
      color: colors.textMuted,
      textDecorationLine: 'line-through',
    },
    afterValue: {
      color: colors.textPrimary,
    },
    empty: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: typography.bodySM.fontFamily,
      fontSize: typography.bodySM.fontSize,
      color: colors.textMuted,
    },
  });
