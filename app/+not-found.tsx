import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/ui/base/Button';
import { Screen } from '@/src/ui/base/Screen';
import { Text } from '@/src/ui/base/Text';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <Screen contentContainerStyle={{ justifyContent: 'center' }}>
      <Text variant="display" weight="bold">
        {t('common.notFoundTitle')}
      </Text>
      <Text color="muted" style={{ marginTop: 12 }}>
        {t('common.notFoundBody')}
      </Text>
      <Button
        title={t('common.goToToday')}
        onPress={() => router.replace('/(tabs)/today')}
        style={{ marginTop: 24 }}
      />
    </Screen>
  );
}
