import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '@components/Badge';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, type Colors } from '@theme/index';
import { formatRelativeTime } from '@utils/dates';
import type { IAccessLogItem } from '@app-types/access';

interface Props {
  item: IAccessLogItem;
}

const REASON_LABELS: Record<string, string> = {
  expired: 'Suscripcion vencida',
  not_found: 'No encontrado',
  active: '',
};

export function AccessLogItem({ item }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.member_name}
        </Text>
        {!item.granted && item.reason ? (
          <Text style={styles.reason}>
            {REASON_LABELS[item.reason] ?? item.reason}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        <Badge
          label={item.granted ? 'CONCEDIDO' : 'DENEGADO'}
          variant={item.granted ? 'active' : 'expired'}
          badgeStyle="pill"
        />
        <Text style={styles.time}>{formatRelativeTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.textPrimary,
  },
  reason: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 11,
    color: colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  time: {
    fontFamily: typography.bodyXS.fontFamily,
    fontSize: 11,
    color: colors.textMuted,
  },
});
