import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SupportedLanguage } from '@/src/domain/models';
import { onboardingService } from '@/src/services/onboarding-service';
import { useAppStore } from '@/src/state/useAppStore';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, OptionPills, Screen, Text, TextField } from '@/src/ui/base';

const ONBOARDING_LANGUAGES: SupportedLanguage[] = ['en', 'tr'];

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const appLanguage = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    const trimmedFirstName = firstName.trim();
    if (!trimmedFirstName) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onboardingService.createInitialProfile({
        firstName: trimmedFirstName,
        lastName: lastName.trim(),
        preferredLanguage: appLanguage,
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : t('onboarding.errorFallback'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll={false} contentContainerStyle={{ justifyContent: 'center' }}>
      <Text color="primary" variant="caption" weight="semibold">
        {t('onboarding.kicker')}
      </Text>
      <Text style={{ marginTop: theme.spacing.sm }} variant="display" weight="bold">
        {t('onboarding.title')}
      </Text>
      <Text color="muted" style={{ marginTop: theme.spacing.md }}>
        {t('onboarding.body')}
      </Text>

      <Card style={{ marginTop: theme.spacing.xl }}>
        <Text variant="title" weight="semibold">
          {t('onboarding.profileTitle')}
        </Text>
        <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
          <OptionPills
            labelMap={(value) => t(`onboarding.languages.${value}`)}
            onSelect={(value) => setLanguage(value)}
            options={ONBOARDING_LANGUAGES}
            selectedValue={appLanguage}
          />
          <TextField
            onChangeText={setFirstName}
            placeholder={t('onboarding.firstName')}
            value={firstName}
          />
          <TextField
            onChangeText={setLastName}
            placeholder={t('onboarding.lastName')}
            value={lastName}
          />
          {error ? (
            <Text style={{ color: theme.colors.danger }} variant="caption">
              {error}
            </Text>
          ) : null}
          <Button
            disabled={submitting || !firstName.trim()}
            onPress={() => void handleContinue()}
            title={submitting ? t('onboarding.creating') : t('onboarding.continue')}
          />
        </View>
      </Card>
    </Screen>
  );
}
