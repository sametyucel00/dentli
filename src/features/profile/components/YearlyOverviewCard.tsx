import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { YearlyCompletionMonth } from '@/src/features/profile/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

export function YearlyOverviewCard({
  months,
}: {
  months: YearlyCompletionMonth[];
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
      <View
        style={{
          alignItems: 'flex-end',
          flexDirection: 'row',
          gap: theme.spacing.sm,
          minHeight: 120,
        }}>
        {months.map((month) => (
          <View key={month.id} style={{ alignItems: 'center', flex: 1, gap: theme.spacing.sm }}>
            <View
              style={{
                backgroundColor:
                  month.completionRate === null
                    ? theme.colors.surfaceMuted
                    : theme.colors.primarySoft,
                borderRadius: theme.radii.sm,
                height: `${Math.max((month.completionRate ?? 0) * 100, 8)}%`,
                minHeight: 10,
                overflow: 'hidden',
                width: '100%',
              }}>
              <View
                style={{
                  backgroundColor:
                    month.completionRate === null
                      ? theme.colors.border
                      : theme.colors.primary,
                  height: '100%',
                  width: '100%',
                }}
              />
            </View>
            <Text variant="caption" color="muted">
              {month.monthLabel}
            </Text>
          </View>
        ))}
      </View>
      <Text color="muted" variant="caption">
        {t('profile.analytics.yearlyLegend')}
      </Text>
    </View>
  );
}
