import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CareItem } from '@/src/domain/models';
import { getCareCountdown } from '@/src/features/care/model';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Card, Text } from '@/src/ui/base';

export function CareItemCard({
  item,
  onPress,
}: {
  item: CareItem;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const countdown = getCareCountdown(item);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.995 : 1 }],
      })}>
      <Card
        style={{
          backgroundColor: countdown.dueNow ? theme.colors.surfaceAccent : theme.colors.surface,
          paddingVertical: theme.spacing.lg,
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text weight="semibold">{item.title}</Text>
            <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
              {t(`careTracking.types.${item.itemType}`)}
            </Text>
            {item.description ? (
              <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                {item.description}
              </Text>
            ) : null}
          </View>
          <View style={{ alignItems: 'flex-end', minWidth: 92 }}>
            <Text variant="caption" color="muted">
              {t('careTracking.countdownLabel')}
            </Text>
            <Text
              color={countdown.dueNow ? 'primary' : 'default'}
              style={{ marginTop: theme.spacing.xs }}
              weight="bold">
              {countdown.daysLeft === null
                ? t('careTracking.notTracked')
                : countdown.dueNow
                  ? t('careTracking.replaceNow')
                  : t('careTracking.daysLeft', { count: countdown.daysLeft })}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
