import React, { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { History } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { EmptyState } from '@components/EmptyState';
import { QueryRenderer } from '@components/QueryRenderer';
import { SkeletonCard, SkeletonList } from '@components/Skeleton';
import { useTheme } from '@hooks/useTheme';
import { haptics } from '@utils/haptics';
import { useMemberWorkoutHistory } from '../hooks/useMyRoutine';
import { WorkoutHistoryList } from '../components/WorkoutHistoryList';
import type { MemberWorkoutHistoryScreenProps } from '@navigation/types';
import { typography, spacing, type Colors } from '@theme/index';

/** Seguimiento (admin): entrenamientos registrados por un miembro. */
export default function MemberWorkoutHistoryScreen({
  navigation,
  route,
}: MemberWorkoutHistoryScreenProps) {
  const { memberId, memberName } = route.params;
  const insets = useSafeAreaInsets();
  const query = useMemberWorkoutHistory(memberId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const refresh = useCallback(() => {
    haptics.light();
    query.refetch();
  }, [query]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Entrenamientos"
        onBack={() => navigation.goBack()}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={query.loading}
            onRefresh={refresh}
            tintColor={colors.primaryRed}
            colors={[colors.primaryRed]}
          />
        }
      >
        <Text style={styles.title}>
          {memberName ? `Historial de ${memberName}` : 'Historial del miembro'}
        </Text>

        <QueryRenderer
          query={query}
          isEmpty={(d) => d.length === 0}
          skeleton={
            <SkeletonList
              count={4}
              renderItem={() => <SkeletonCard height={100} />}
            />
          }
          empty={
            <EmptyState
              icon={History}
              title="Sin entrenamientos registrados"
              description="Cuando el miembro registre sus rutinas, aparecerán aquí."
            />
          }
        >
          {(logs) => <WorkoutHistoryList logs={logs} />}
        </QueryRenderer>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, gap: 8 },
    title: {
      fontFamily: typography.titleS.fontFamily,
      fontSize: typography.titleS.fontSize,
      color: colors.textPrimary,
      marginBottom: 8,
    },
  });
