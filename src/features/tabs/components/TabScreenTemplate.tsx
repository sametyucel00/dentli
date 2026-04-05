import { useTranslation } from 'react-i18next';

import { ProfileSummaryCard } from '@/src/features/profile/components';
import { TabRouteKey } from '@/src/features/tabs/config';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, Screen, Text } from '@/src/ui/base';

type TabScreenTemplateProps = {
  tabKey: TabRouteKey;
  showPreferencesPanel?: boolean;
};

export function TabScreenTemplate({
  tabKey,
  showPreferencesPanel = false,
}: TabScreenTemplateProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const translationBaseKey = `screens.${tabKey}`;

  return (
    <Screen>
      <Text color="primary" variant="caption" weight="semibold">
        {t(`${translationBaseKey}.eyebrow`)}
      </Text>

      <Text style={{ marginTop: theme.spacing.sm }} variant="display" weight="bold">
        {t(`${translationBaseKey}.title`)}
      </Text>

      <Text color="muted" style={{ marginTop: theme.spacing.md }}>
        {t(`${translationBaseKey}.description`)}
      </Text>

      <Card style={{ marginTop: theme.spacing.xxl }}>
        <Text variant="title" weight="semibold">
          {t(`${translationBaseKey}.primaryCardTitle`)}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t(`${translationBaseKey}.primaryCardBody`)}
        </Text>
        <Button
          title={t('common.placeholderCta')}
          style={{ alignSelf: 'flex-start', marginTop: theme.spacing.lg }}
          variant="secondary"
        />
      </Card>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text variant="title" weight="semibold">
          {t(`${translationBaseKey}.secondaryCardTitle`)}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t(`${translationBaseKey}.secondaryCardBody`)}
        </Text>
      </Card>

      <ProfileSummaryCard showPreferences={showPreferencesPanel} />
    </Screen>
  );
}
