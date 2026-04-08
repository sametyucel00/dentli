import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatDateTime } from '@/src/features/today/formatters';
import { TimelineItem } from '@/src/features/timeline/model';
import { getTimelineItemCopy, getTimelineItemIcon } from '@/src/features/timeline/presentation';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { useAppLocale } from '@/src/i18n/useAppLocale';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Card, Text } from '@/src/ui/base';

export function TimelineListItem({
  item,
  onPress,
}: {
  item: TimelineItem;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const locale = useAppLocale();
  const { theme } = useAppTheme();
  const { isExpanded } = useResponsiveLayout();
  const copy = getTimelineItemCopy(item, t);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.995 : 1 }],
      })}>
      <Card style={{ paddingVertical: theme.spacing.lg }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.radii.pill,
              height: 40,
              justifyContent: 'center',
              width: 40,
            }}>
            <Ionicons color={theme.colors.primary} name={getTimelineItemIcon(item.kind)} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text weight="semibold">{copy.title}</Text>
            <Text color="muted" numberOfLines={1} style={{ marginTop: theme.spacing.xs }}>
              {copy.subtitle}
            </Text>
            {item.kind === 'symptom' && item.event.severity !== null ? (
              <Text color="muted" variant="caption" style={{ marginTop: theme.spacing.xs }}>
                {t('timeline.severityLabel', { value: item.event.severity })}
              </Text>
            ) : null}
          </View>
          <View style={{ alignItems: 'flex-end', maxWidth: isExpanded ? 148 : 96 }}>
            <Text color="muted" variant="caption" style={{ textAlign: 'right' }}>
              {formatDateTime(item.occurredAt, locale, '')}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
