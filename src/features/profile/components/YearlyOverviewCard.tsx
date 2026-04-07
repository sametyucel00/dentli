import { View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { YearlyCompletionMonth } from '@/src/features/profile/model';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
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
  const { isTablet } = useResponsiveLayout();
  const isCompactWidth = width < 390;

  return (
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          justifyContent: 'space-between',
        }}>
        {months.map((month) => (
          <View
            key={month.id}
            style={{
              alignItems: 'center',
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.radii.md,
              flexBasis: isTablet ? '23.5%' : isCompactWidth ? '23%' : '23.5%',
              gap: theme.spacing.xs,
              minWidth: 0,
              paddingHorizontal: theme.spacing.xs,
              paddingVertical: theme.spacing.sm,
            }}>
            <Text numberOfLines={1} style={{ textAlign: 'center' }} variant="caption" color="muted">
              {month.monthLabel}
            </Text>
            <View
              style={{
                alignItems: 'center',
                borderColor: month.completionRate === null ? theme.colors.border : theme.colors.primary,
                borderRadius: 999,
                borderWidth: 2,
                height: isCompactWidth ? 42 : 48,
                justifyContent: 'center',
                width: isCompactWidth ? 42 : 48,
              }}>
              {month.completionRate === null ? (
                <View
                  style={{
                    backgroundColor: theme.colors.border,
                    borderRadius: 999,
                    height: 12,
                    opacity: 0.45,
                    width: 12,
                  }}
                />
              ) : (
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: theme.colors.primary,
                    borderRadius: 999,
                    height: '76%',
                    justifyContent: 'center',
                    width: '76%',
                  }}>
                  <Text
                    style={{ color: theme.colors.textInverse, textAlign: 'center' }}
                    variant="caption"
                    weight="semibold">
                    {Math.round(month.completionRate * 100)}
                  </Text>
                </View>
              )}
            </View>
            <Text numberOfLines={1} style={{ textAlign: 'center' }} variant="caption" weight="semibold">
              {month.completionRate === null ? '--' : `${Math.round(month.completionRate * 100)}%`}
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
