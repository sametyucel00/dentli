import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CareItem } from '@/src/domain/models';
import { getCareCountdown } from '@/src/features/care/model';
import { formatDateTime } from '@/src/features/today/formatters';
import { useAppLocale } from '@/src/i18n/useAppLocale';
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
  const locale = useAppLocale();
  const countdown = getCareCountdown(item);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignSelf: 'stretch',
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.995 : 1 }],
      })}>
      <Card
        style={{
          backgroundColor: countdown.dueNow ? theme.colors.surfaceAccent : theme.colors.surface,
          paddingVertical: theme.spacing.lg,
        }}>
        <View style={{ gap: theme.spacing.md }}>
          <View>
            <Text weight="semibold">{item.title}</Text>
            <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
              {t(`careTracking.types.${item.itemType}`)}
            </Text>
          </View>
          {item.description ? (
            <Text color="muted">{item.description}</Text>
          ) : null}
          <View style={{ gap: theme.spacing.xs }}>
            <Text color="muted">
              {t('careTracking.countdownLabel')}: {countdown.daysLeft === null
                ? t('careTracking.notTracked')
                : countdown.dueNow
                  ? t('careTracking.replaceNow')
                  : t('careTracking.daysLeft', { count: countdown.daysLeft })}
            </Text>
            <Text color="muted">
              {t('careTracking.form.lastReplacedDate')}: {formatDateTime(item.lastReplacedAt, locale, t('careTracking.notTracked'))}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
