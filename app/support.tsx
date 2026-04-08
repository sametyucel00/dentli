import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, Screen, Text } from '@/src/ui/base';

export default function SupportScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const faqKeys = [
    'faqOne',
    'faqTwo',
    'faqThree',
    'faqFour',
    'faqFive',
    'faqSix',
    'faqSeven',
  ] as const;

  return (
    <Screen>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button onPress={() => router.back()} title={t('legal.back')} variant="ghost" />
        <Text variant="title" weight="semibold">
          {t('legal.support.title')}
        </Text>
      </View>

      <Card style={{ marginTop: theme.spacing.xl }}>
        <Text weight="semibold">{t('legal.support.emailTitle')}</Text>
        <Text color="primary" style={{ marginTop: theme.spacing.sm }} weight="semibold">
          {t('legal.support.email')}
        </Text>
      </Card>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text weight="semibold">{t('legal.support.faqTitle')}</Text>
        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          {faqKeys.map((key) => (
            <Text key={key} color="muted">
              {'\u2022'} {t(`legal.support.${key}`)}
            </Text>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
