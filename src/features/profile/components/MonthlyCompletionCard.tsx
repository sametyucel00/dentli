import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { MonthlyCompletionMetric } from '@/src/features/profile/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

function formatPercent(rate: number) {
  if (!Number.isFinite(rate)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(rate * 100)));
}

export function MonthlyCompletionCard({
  metrics,
}: {
  metrics: MonthlyCompletionMetric[];
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isExpanded } = useResponsiveLayout();

  return (
    <View
      style={{
        flexDirection: isExpanded ? 'row' : 'column',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
      }}>
      {metrics.map((metric) => (
        <View
          key={metric.id}
          style={{
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radii.md,
            flexBasis: isExpanded ? '48.5%' : '100%',
            gap: theme.spacing.xs,
            padding: theme.spacing.md,
          }}>
          {(() => {
            const isTracked = metric.expectedCount > 0 && Number.isFinite(metric.completionRate);
            const percent = formatPercent(metric.completionRate);

            return (
              <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text weight={metric.id === 'overall' ? 'semibold' : 'medium'}>
              {t(`profile.analytics.metrics.${metric.id}`)}
            </Text>
            <Text color="muted">
              {isTracked ? `${percent}%` : t('profile.analytics.notTracked')}
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
                width: isTracked ? `${percent}%` : '0%',
              }}
            />
          </View>
          <Text color="muted" variant="caption">
            {isTracked
              ? t('profile.analytics.metricDetail', {
                  completed: metric.completedCount,
                  expected: metric.expectedCount,
                })
              : t('profile.analytics.notTracked')}
          </Text>
              </>
            );
          })()}
        </View>
      ))}
    </View>
  );
}
