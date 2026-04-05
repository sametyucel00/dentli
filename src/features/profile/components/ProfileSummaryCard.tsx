import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { settingsService } from '@/src/services/settings-service';
import {
  getAlternateLanguage,
  useSelectedProfileSummary,
} from '@/src/state/selectors';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, Text } from '@/src/ui/base';

export function ProfileSummaryCard({
  title,
  emptyBody,
  showPreferences = false,
}: {
  title?: string;
  emptyBody?: string;
  showPreferences?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { selectedProfile, appointmentsCount, careItemsCount } =
    useSelectedProfileSummary();

  return (
    <Card style={{ marginTop: theme.spacing.lg }}>
      {title ? (
        <Text variant="title" weight="semibold">
          {title}
        </Text>
      ) : null}

      {selectedProfile ? (
        <View style={{ marginTop: title ? theme.spacing.md : 0 }}>
          <Text variant="caption" color="muted">
            {t('common.selectedProfile')}
          </Text>
          <Text style={{ marginTop: theme.spacing.xs }} weight="semibold">
            {selectedProfile.firstName} {selectedProfile.lastName}
          </Text>
          <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
            {t('common.appointmentsCount', { count: appointmentsCount })} {'\u2022'}{' '}
            {t('common.careItemsCount', { count: careItemsCount })}
          </Text>
        </View>
      ) : emptyBody ? (
        <Text color="muted" style={{ marginTop: title ? theme.spacing.md : 0 }}>
          {emptyBody}
        </Text>
      ) : null}

      {showPreferences ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.md,
            marginTop: theme.spacing.lg,
          }}>
          <Button
            title={t('common.switchTheme')}
            onPress={() => settingsService.toggleThemeMode()}
            variant="secondary"
          />
          <Button
            title={t('common.switchLanguage')}
            onPress={() => settingsService.applyLanguage(getAlternateLanguage(i18n.language))}
            variant="ghost"
          />
        </View>
      ) : null}
    </Card>
  );
}
