import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SupportedLanguage } from '@/src/domain/models';
import { onboardingService } from '@/src/services/onboarding-service';
import { useAppStore } from '@/src/state/useAppStore';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, OptionPills, Screen, Text, TextField } from '@/src/ui/base';

const ONBOARDING_LANGUAGES: SupportedLanguage[] = ['en', 'tr'];
const BRUSHING_FREQUENCY_OPTIONS = [1, 2] as const;
const FLOSS_FREQUENCY_OPTIONS = [1, 7] as const;
const MOUTHWASH_FREQUENCY_OPTIONS = [1, 7] as const;
const TIME_OPTIONS_MORNING = ['07:00', '08:00', '09:00'] as const;
const TIME_OPTIONS_NIGHT = ['20:30', '21:00', '22:00'] as const;
const QUIET_START_OPTIONS = ['21:30', '22:00', '23:00'] as const;
const QUIET_END_OPTIONS = ['07:00', '08:00', '09:00'] as const;
const CENTERED_PILL_STYLE = { justifyContent: 'center' } as const;

type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const appLanguage = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
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
  const [quietHoursStart, setQuietHoursStart] = useState<string>('22:30');
  const [quietHoursEnd, setQuietHoursEnd] = useState<string>('08:00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 6;
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
        preferredLanguage: appLanguage,
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
        requestNotificationPermission,
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
            <Card style={{ padding: theme.spacing.lg }}>
              <Text weight="semibold">{t('onboarding.localFirst.title')}</Text>
              <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                {t('onboarding.localFirst.body')}
              </Text>
            </Card>
          </View>
        );
      case 1:
        return (
          <View style={{ gap: theme.spacing.lg }}>
            <Text variant="title" weight="semibold">
              {t('onboarding.steps.language.title')}
            </Text>
            <Text color="muted">{t('onboarding.steps.language.body')}</Text>
            <OptionPills
              containerStyle={CENTERED_PILL_STYLE}
              labelMap={(value) => t(`onboarding.languages.${value}`)}
              onSelect={(value) => setLanguage(value)}
              options={ONBOARDING_LANGUAGES}
              selectedValue={appLanguage}
            />
          </View>
        );
      case 2:
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
      case 3:
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
      case 4:
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
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="caption" color="muted" weight="semibold">
                {t('onboarding.quietStart')}
              </Text>
              <OptionPills
                containerStyle={CENTERED_PILL_STYLE}
                labelMap={(value) => value}
                onSelect={setQuietHoursStart}
                options={QUIET_START_OPTIONS}
                selectedValue={quietHoursStart}
              />
            </View>
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="caption" color="muted" weight="semibold">
                {t('onboarding.quietEnd')}
              </Text>
              <OptionPills
                containerStyle={CENTERED_PILL_STYLE}
                labelMap={(value) => value}
                onSelect={setQuietHoursEnd}
                options={QUIET_END_OPTIONS}
                selectedValue={quietHoursEnd}
              />
            </View>
          </View>
        );
      case 5:
      default:
        return (
          <View style={{ gap: theme.spacing.lg }}>
            <Text variant="title" weight="semibold">
              {t('onboarding.steps.notifications.title')}
            </Text>
            <Text color="muted">{t('onboarding.steps.notifications.body')}</Text>
            <Card style={{ padding: theme.spacing.lg }}>
              <Text weight="semibold">{t('onboarding.permissionCard.title')}</Text>
              <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                {t('onboarding.permissionCard.body')}
              </Text>
            </Card>
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="caption" color="muted" weight="semibold">
                {t('onboarding.remindersLabel')}
              </Text>
              <OptionPills
                containerStyle={CENTERED_PILL_STYLE}
                labelMap={(value) => t(value ? 'common.enabled' : 'common.disabled')}
                onSelect={setRemindersEnabled}
                options={[true, false]}
                selectedValue={remindersEnabled}
              />
            </View>
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="caption" color="muted" weight="semibold">
                {t('onboarding.notificationPermissionLabel')}
              </Text>
              <OptionPills
                containerStyle={CENTERED_PILL_STYLE}
                labelMap={(value) => t(value ? 'common.enabled' : 'common.disabled')}
                onSelect={setRequestNotificationPermission}
                options={[true, false]}
                selectedValue={requestNotificationPermission}
              />
            </View>
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
              style={{ flexBasis: '48%', minWidth: 0 }}
              title={t('onboarding.back')}
              variant="secondary"
            />
          ) : (
            <View style={{ flexBasis: '48%', minWidth: 0 }} />
          )}
          <Button
            disabled={submitting || !canContinue}
            onPress={() => void (step === totalSteps - 1 ? handleFinish() : goNext())}
            style={{ flexBasis: '48%', minWidth: 0 }}
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
