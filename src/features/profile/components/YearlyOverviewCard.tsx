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
              alignItems: 'flex-start',
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.radii.md,
              flexBasis: isTablet ? '23.5%' : isCompactWidth ? '23%' : '23.5%',
              gap: theme.spacing.xs,
              minWidth: 0,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.sm,
            }}>
            <Text numberOfLines={1} variant="caption" color="muted">
              {month.monthLabel}
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: theme.radii.pill,
                height: 36,
                justifyContent: 'flex-end',
                overflow: 'hidden',
                width: '100%',
              }}>
              <View
                style={{
                  backgroundColor:
                    month.completionRate === null ? theme.colors.border : theme.colors.primary,
                  borderRadius: theme.radii.pill,
                  height: `${Math.max((month.completionRate ?? 0) * 100, 8)}%`,
                  minHeight: 8,
                  width: '100%',
                }}
              />
            </View>
            <Text variant="caption" weight="semibold">
              {month.completionRate === null
                ? '--'
                : `${Math.round(month.completionRate * 100)}%`}
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
