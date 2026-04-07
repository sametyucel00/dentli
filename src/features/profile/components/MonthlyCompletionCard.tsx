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
  const { isTablet } = useResponsiveLayout();

  const rows = isTablet
    ? [
        metrics.slice(0, 2),
        metrics.slice(2, 4),
      ]
    : metrics.map((metric) => [metric]);

  return (
    <View
      style={{
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
        width: '100%',
      }}>
      {rows.map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          style={{
            flexDirection: isTablet ? 'row' : 'column',
            gap: theme.spacing.md,
            width: '100%',
          }}>
          {row.map((metric) => {
            const isTracked = metric.expectedCount > 0 && Number.isFinite(metric.completionRate);
            const percent = formatPercent(metric.completionRate);

            return (
              <View
                key={metric.id}
                style={{
                  backgroundColor: theme.colors.surfaceMuted,
                  borderRadius: theme.radii.md,
                  flex: isTablet ? 1 : undefined,
                  gap: theme.spacing.xs,
                  padding: theme.spacing.md,
                  width: isTablet ? undefined : '100%',
                }}>
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
                    backgroundColor: theme.colors.backgroundElevated,
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
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
