import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AnalyticsHeatmapCell } from '@/src/features/profile/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

function getCellBackgroundColor(
  intensity: AnalyticsHeatmapCell['intensity'],
  colors: ReturnType<typeof useAppTheme>['theme']['colors'],
) {
  if (intensity === 4) return colors.primary;
  if (intensity === 3) return colors.accent;
  if (intensity === 2) return colors.primarySoft;
  if (intensity === 1) return colors.surfaceAccent;
  return colors.surfaceMuted;
}

export function WeeklyHeatmap({
  cells,
}: {
  cells: AnalyticsHeatmapCell[];
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View style={{ marginTop: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {cells.map((cell) => (
          <View key={cell.id} style={{ alignItems: 'center', flex: 1, gap: theme.spacing.sm }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: getCellBackgroundColor(cell.intensity, theme.colors),
                borderColor: cell.intensity === 0 ? theme.colors.border : 'transparent',
                borderRadius: theme.radii.sm,
                borderWidth: 1,
                justifyContent: 'center',
                minHeight: 56,
                paddingHorizontal: theme.spacing.xs,
                width: '100%',
              }}>
              <Text
                style={{
                  color:
                    cell.intensity >= 3
                      ? theme.colors.textInverse
                      : theme.colors.text,
                }}
                variant="caption"
                weight="semibold">
                {cell.completedCount}/{cell.expectedCount}
              </Text>
            </View>
            <Text variant="caption" color="muted">
              {cell.dayLabel}
            </Text>
          </View>
        ))}
      </View>

      <Text color="muted" style={{ marginTop: theme.spacing.md }} variant="caption">
        {t('profile.analytics.weeklyLegend')}
      </Text>
    </View>
  );
}
