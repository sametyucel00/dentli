import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/src/ui/base';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <Screen>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button onPress={() => router.back()} title={t('legal.back')} variant="ghost" />
        <Text variant="title" weight="semibold">
          {t('legal.privacy.title')}
        </Text>
      </View>

      <Card style={{ marginTop: theme.spacing.xl }}>
        <Text weight="semibold">{t('legal.privacy.summaryTitle')}</Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t('legal.privacy.summaryBody')}
        </Text>
      </Card>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text weight="semibold">{t('legal.privacy.localDataTitle')}</Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t('legal.privacy.localDataBody')}
        </Text>
      </Card>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text weight="semibold">{t('legal.privacy.notificationsTitle')}</Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t('legal.privacy.notificationsBody')}
        </Text>
      </Card>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text weight="semibold">{t('legal.privacy.purchaseTitle')}</Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t('legal.privacy.purchaseBody')}
        </Text>
      </Card>
    </Screen>
  );
}
