import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, FilePlus, FileX, Pencil } from 'lucide-react-native';
import { Badge } from '@components/Badge';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, radii, type Colors } from '@theme/index';
import { formatRelativeTime } from '@utils/dates';
import {
  operationDescriptor,
  shortRowId,
  tableLabel,
} from '../utils/auditLabels';
import type { IAuditLogItem } from '@app-types/audit';

interface Props {
  item: IAuditLogItem;
  onPress: (item: IAuditLogItem) => void;
}

const SYSTEM_LABEL = 'Sistema';

function IconForOperation({
  operation,
  color,
}: {
  operation: IAuditLogItem['operation'];
  color: string;
}) {
  if (operation === 'INSERT') return <FilePlus size={18} color={color} strokeWidth={2} />;
  if (operation === 'DELETE') return <FileX size={18} color={color} strokeWidth={2} />;
  return <Pencil size={18} color={color} strokeWidth={2} />;
}

export function AuditLogItem({ item, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const desc = operationDescriptor(item.operation);
  const target = tableLabel(item.tableSchema, item.tableName);
  const actor = item.actorEmail ?? SYSTEM_LABEL;
  const iconColor =
    item.operation === 'INSERT'
      ? colors.badgeActive
      : item.operation === 'DELETE'
        ? colors.badgeExpired
        : colors.textSecondary;

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: colors.inputBgAlt },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.inputBgAlt }]}>
        <IconForOperation operation={item.operation} color={iconColor} />
      </View>

      <View style={styles.info}>
        <Text style={styles.actor} numberOfLines={1}>
          {actor}
        </Text>
        <Text style={styles.action} numberOfLines={1}>
          {desc.verb} {target.toLowerCase()} · {shortRowId(item.rowId)}
        </Text>
      </View>

      <View style={styles.right}>
        <Badge label={desc.label} variant={desc.badgeVariant} badgeStyle="pill" />
        <Text style={styles.time}>{formatRelativeTime(item.changedAt)}</Text>
      </View>

      <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: { flex: 1, gap: 2 },
    actor: {
      fontFamily: typography.bodyS.fontFamily,
      fontSize: typography.bodyS.fontSize,
      color: colors.textPrimary,
    },
    action: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 11,
      color: colors.textMuted,
    },
    right: { alignItems: 'flex-end', gap: 4 },
    time: {
      fontFamily: typography.bodyXS.fontFamily,
      fontSize: 11,
      color: colors.textMuted,
    },
  });
