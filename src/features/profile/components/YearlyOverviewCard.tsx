import { View, useWindowDimensions } from 'react-native';
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
  const rows = [months.slice(0, 4), months.slice(4, 8), months.slice(8, 12)];

  return (
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.sm }}>
        {rows.map((row, rowIndex) => (
          <View
            key={`row_${rowIndex}`}
            style={{
              flexDirection: 'row',
              gap: theme.spacing.sm,
              justifyContent: 'space-between',
            }}>
            {row.map((month) => (
              <View
                key={month.id}
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceMuted,
                  borderRadius: theme.radii.md,
                  flex: 1,
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
        ))}
      </View>
      <Text color="muted" variant="caption">
        {t('profile.analytics.yearlyLegend')}
      </Text>
    </View>
  );
}
