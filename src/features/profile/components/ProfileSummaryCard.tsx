import { useTranslation } from 'react-i18next';
import { View, useWindowDimensions } from 'react-native';

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
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 390;
  const isVeryNarrow = width < 350;
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
            justifyContent: 'center',
            marginTop: theme.spacing.lg,
          }}>
          <Button
            style={{ flexBasis: isVeryNarrow ? '100%' : '47%', maxWidth: 220 }}
            title={isCompactWidth ? t('common.switchTheme').replace(' ', '\n') : t('common.switchTheme')}
            onPress={() => void settingsService.toggleThemeMode()}
            variant="secondary"
          />
          <Button
            style={{ flexBasis: isVeryNarrow ? '100%' : '47%', maxWidth: 220 }}
            title={isCompactWidth ? t('common.switchLanguage').replace(' ', '\n') : t('common.switchLanguage')}
            onPress={() => void settingsService.applyLanguage(getAlternateLanguage(i18n.language))}
            variant="secondary"
          />
        </View>
      ) : null}
    </Card>
  );
}
