import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MonthlyCompletionMetric } from '@/src/features/profile/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

function formatPercent(rate: number) {
  return Math.round(rate * 100);
}

export function MonthlyCompletionCard({
  metrics,
}: {
  metrics: MonthlyCompletionMetric[];
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
      {metrics.map((metric) => (
        <View key={metric.id} style={{ gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text weight={metric.id === 'overall' ? 'semibold' : 'medium'}>
              {t(`profile.analytics.metrics.${metric.id}`)}
            </Text>
            <Text color="muted">
              {formatPercent(metric.completionRate)}%
            </Text>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.radii.pill,
              height: 8,
              overflow: 'hidden',
            }}>
            <View
              style={{
                backgroundColor:
                  metric.id === 'overall'
                    ? theme.colors.primary
                    : theme.colors.accent,
                borderRadius: theme.radii.pill,
                height: '100%',
                width: `${formatPercent(metric.completionRate)}%`,
              }}
            />
          </View>
          <Text color="muted" variant="caption">
            {t('profile.analytics.metricDetail', {
              completed: metric.completedCount,
              expected: metric.expectedCount,
            })}
          </Text>
        </View>
      ))}
    </View>
  );
}
