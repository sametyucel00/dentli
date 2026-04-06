import { ScrollView, View, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 390;

  return (
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
      <ScrollView
        horizontal
        bounces={false}
        contentContainerStyle={{ alignItems: 'flex-end', gap: theme.spacing.sm }}
        showsHorizontalScrollIndicator={false}>
        <View
          style={{
            alignItems: 'flex-end',
            flexDirection: 'row',
            gap: theme.spacing.sm,
            minHeight: isCompactWidth ? 132 : 120,
            minWidth: isCompactWidth ? months.length * 34 : undefined,
          }}>
          {months.map((month) => (
            <View
              key={month.id}
              style={{
                alignItems: 'center',
                gap: theme.spacing.sm,
                width: isCompactWidth ? 28 : undefined,
                flex: isCompactWidth ? undefined : 1,
              }}>
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
              <Text
                numberOfLines={2}
                style={{ textAlign: 'center' }}
                variant="caption"
                color="muted">
                {month.monthLabel}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Text color="muted" variant="caption">
        {t('profile.analytics.yearlyLegend')}
      </Text>
    </View>
  );
}
