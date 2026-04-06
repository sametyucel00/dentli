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

function formatCompletionLabel(cell: AnalyticsHeatmapCell) {
  if (!Number.isFinite(cell.completionRate) || cell.expectedCount <= 0) {
    return '--';
  }

  return `${Math.round(cell.completionRate * 100)}%`;
}

function formatCountLabel(cell: AnalyticsHeatmapCell) {
  if (cell.expectedCount <= 0) {
    return '--';
  }

  return `(${cell.completedCount}/${cell.expectedCount})`;
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
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
        {cells.map((cell) => (
          <View
            key={cell.id}
            style={{ alignItems: 'center', flex: 1, gap: theme.spacing.xs, minWidth: 0 }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: getCellBackgroundColor(cell.intensity, theme.colors),
                borderColor: cell.intensity === 0 ? theme.colors.border : 'transparent',
                borderRadius: theme.radii.sm,
                borderWidth: theme.mode === 'dark' && cell.intensity === 0 ? 1 : 0,
                justifyContent: 'center',
                aspectRatio: 1,
                minHeight: 44,
                paddingHorizontal: theme.spacing.xxs,
                width: '100%',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color:
                    cell.intensity >= 3
                      ? theme.colors.textInverse
                      : theme.colors.text,
                  textAlign: 'center',
                }}
                variant="caption"
                weight="semibold">
                {formatCompletionLabel(cell)}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color:
                    cell.intensity >= 3
                      ? theme.colors.textInverse
                      : theme.colors.textMuted,
                  marginTop: theme.spacing.xxs,
                  textAlign: 'center',
                }}
                variant="caption">
                {formatCountLabel(cell)}
              </Text>
            </View>
            <Text numberOfLines={1} variant="caption" color="muted">
              {cell.dayLabel.slice(0, 2)}
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
