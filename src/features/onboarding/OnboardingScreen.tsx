import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { onboardingService } from '@/src/services/onboarding-service';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, OptionPills, Screen, Text, TextField } from '@/src/ui/base';

const BRUSHING_FREQUENCY_OPTIONS = [1, 2] as const;
const FLOSS_FREQUENCY_OPTIONS = [1, 7] as const;
const MOUTHWASH_FREQUENCY_OPTIONS = [1, 7] as const;
const TIME_OPTIONS_MORNING = ['07:00', '08:00', '09:00'] as const;
const TIME_OPTIONS_NIGHT = ['20:30', '21:00', '22:00'] as const;
const CENTERED_PILL_STYLE = { justifyContent: 'center' } as const;

type OnboardingStep = 0 | 1 | 2 | 3 | 4;

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [step, setStep] = useState<OnboardingStep>(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [brushingFrequencyPerDay, setBrushingFrequencyPerDay] = useState<1 | 2>(2);
  const [flossingEnabled, setFlossingEnabled] = useState(true);
  const [flossSessionsPerWeek, setFlossSessionsPerWeek] = useState<number>(1);
  const [mouthwashEnabled, setMouthwashEnabled] = useState(true);
  const [mouthwashSessionsPerWeek, setMouthwashSessionsPerWeek] = useState<number>(1);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [requestNotificationPermission, setRequestNotificationPermission] = useState(true);
  const [morningReminderTime, setMorningReminderTime] = useState<string>('08:00');
  const [nightReminderTime, setNightReminderTime] = useState<string>('21:00');
  const [quietHoursStart] = useState<string>('22:30');
  const [quietHoursEnd] = useState<string>('08:00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 5;
  const canContinue = useMemo(() => {
    if (step === 0) {
      return firstName.trim().length > 0;
    }

    return true;
  }, [firstName, step]);

  async function handleFinish() {
    if (!firstName.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onboardingService.createInitialProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        preferredLanguage: 'en',
        brushingFrequencyPerDay,
        flossingEnabled,
        flossSessionsPerWeek,
        mouthwashEnabled,
        mouthwashSessionsPerWeek,
        remindersEnabled,
        morningReminderTime,
        nightReminderTime,
        quietHoursStart,
        quietHoursEnd,
        requestNotificationPermission: remindersEnabled && requestNotificationPermission,
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : t('onboarding.errorFallback'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    setStep((current) => Math.min(current + 1, totalSteps - 1) as OnboardingStep);
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0) as OnboardingStep);
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <View style={{ gap: theme.spacing.lg }}>
            <Text variant="title" weight="semibold">
              {t('onboarding.steps.welcome.title')}
            </Text>
            <Text color="muted">{t('onboarding.steps.welcome.body')}</Text>
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
            <Text color="muted" variant="caption">
              {t('onboarding.localFirst.body')}
            </Text>
          </View>
        );
      case 1:
        return (
          <View style={{ gap: theme.spacing.lg }}>
            <Text variant="title" weight="semibold">
              {t('onboarding.steps.brushing.title')}
            </Text>
            <Text color="muted">{t('onboarding.steps.brushing.body')}</Text>
            <OptionPills
              containerStyle={CENTERED_PILL_STYLE}
              labelMap={(value) => t(`onboarding.brushingFrequency.${value}`)}
              onSelect={(value) => setBrushingFrequencyPerDay(value)}
              options={BRUSHING_FREQUENCY_OPTIONS}
              selectedValue={brushingFrequencyPerDay}
            />
          </View>
        );
      case 2:
        return (
          <View style={{ gap: theme.spacing.lg }}>
            <Text variant="title" weight="semibold">
              {t('onboarding.steps.routine.title')}
            </Text>
            <Text color="muted">{t('onboarding.steps.routine.body')}</Text>
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="caption" color="muted" weight="semibold">
                {t('onboarding.flossingLabel')}
              </Text>
              <OptionPills
                containerStyle={CENTERED_PILL_STYLE}
                labelMap={(value) => t(value ? 'common.enabled' : 'common.disabled')}
                onSelect={(value) => {
                  setFlossingEnabled(value);
                  if (!value) {
                    setFlossSessionsPerWeek(1);
                  }
                }}
                options={[true, false]}
                selectedValue={flossingEnabled}
              />
            </View>
            {flossingEnabled ? (
              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('onboarding.flossFrequency')}
                </Text>
                <OptionPills
                  containerStyle={CENTERED_PILL_STYLE}
                  labelMap={(value) => t(`onboarding.flossFrequencyOptions.${value}`)}
                  onSelect={setFlossSessionsPerWeek}
                  options={FLOSS_FREQUENCY_OPTIONS}
                  selectedValue={flossSessionsPerWeek}
                />
              </View>
            ) : null}
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="caption" color="muted" weight="semibold">
                {t('onboarding.mouthwashLabel')}
              </Text>
              <OptionPills
                containerStyle={CENTERED_PILL_STYLE}
                labelMap={(value) => t(value ? 'common.enabled' : 'common.disabled')}
                onSelect={(value) => {
                  setMouthwashEnabled(value);
                  if (!value) {
                    setMouthwashSessionsPerWeek(1);
                  }
                }}
                options={[true, false]}
                selectedValue={mouthwashEnabled}
              />
            </View>
            {mouthwashEnabled ? (
              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('onboarding.mouthwashFrequency')}
                </Text>
                <OptionPills
                  containerStyle={CENTERED_PILL_STYLE}
                  labelMap={(value) => t(`onboarding.flossFrequencyOptions.${value}`)}
                  onSelect={setMouthwashSessionsPerWeek}
                  options={MOUTHWASH_FREQUENCY_OPTIONS}
                  selectedValue={mouthwashSessionsPerWeek}
                />
              </View>
            ) : null}
          </View>
        );
      case 3:
        return (
          <View style={{ gap: theme.spacing.lg }}>
            <Text variant="title" weight="semibold">
              {t('onboarding.steps.schedule.title')}
            </Text>
            <Text color="muted">{t('onboarding.steps.schedule.body')}</Text>
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="caption" color="muted" weight="semibold">
                {t('onboarding.morningReminder')}
              </Text>
              <OptionPills
                containerStyle={CENTERED_PILL_STYLE}
                labelMap={(value) => value}
                onSelect={setMorningReminderTime}
                options={TIME_OPTIONS_MORNING}
                selectedValue={morningReminderTime}
              />
            </View>
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="caption" color="muted" weight="semibold">
                {t('onboarding.nightReminder')}
              </Text>
              <OptionPills
                containerStyle={CENTERED_PILL_STYLE}
                labelMap={(value) => value}
                onSelect={setNightReminderTime}
                options={TIME_OPTIONS_NIGHT}
                selectedValue={nightReminderTime}
              />
            </View>
          </View>
        );
      case 4:
      default:
        return (
          <View style={{ gap: theme.spacing.lg }}>
            <Text variant="title" weight="semibold">
              {t('onboarding.steps.notifications.title')}
            </Text>
            <Text color="muted">{t('onboarding.steps.notifications.body')}</Text>
            <OptionPills
              containerStyle={CENTERED_PILL_STYLE}
              labelMap={(value) => t(value ? 'common.enabled' : 'common.disabled')}
              onSelect={(value) => {
                setRemindersEnabled(value);
                setRequestNotificationPermission(value);
              }}
              options={[true, false]}
              selectedValue={remindersEnabled}
            />
          </View>
        );
    }
  }

  return (
    <Screen contentContainerStyle={{ justifyContent: 'center' }}>
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
        <Text color="muted" variant="caption" weight="semibold">
          {t('onboarding.progress', { current: step + 1, total: totalSteps })}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.md,
          }}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <View
              key={index}
              style={{
                backgroundColor:
                  index <= step ? theme.colors.primary : theme.colors.surfaceMuted,
                borderRadius: theme.radii.pill,
                flex: 1,
                height: 6,
              }}
            />
          ))}
        </View>

        <View style={{ marginTop: theme.spacing.xl }}>{renderStep()}</View>

        {error ? (
          <Text style={{ color: theme.colors.danger, marginTop: theme.spacing.md }} variant="caption">
            {error}
          </Text>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl,
            justifyContent: 'center',
          }}>
          {step > 0 ? (
            <Button
              onPress={goBack}
              style={{ flex: 1, minWidth: 0 }}
              title={t('onboarding.back')}
              variant="secondary"
            />
          ) : (
            <View style={{ flex: 1, minWidth: 0 }} />
          )}
          <Button
            disabled={submitting || !canContinue}
            onPress={() => void (step === totalSteps - 1 ? handleFinish() : goNext())}
            style={{ flex: 1, minWidth: 0 }}
            title={
              step === totalSteps - 1
                ? submitting
                  ? t('onboarding.creating')
                  : t('onboarding.finish')
                : t('onboarding.continue')
            }
          />
        </View>
      </Card>
    </Screen>
  );
}
