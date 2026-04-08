import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useSelectedProfileSummary } from '@/src/state/selectors';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Card, Text } from '@/src/ui/base';

export function ProfileSummaryCard({
  title,
  emptyBody,
  showPreferences = false,
}: {
  title?: string;
  emptyBody?: string;
  showPreferences?: boolean;
}) {
  const { t } = useTranslation();
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

    </Card>
  );
}
