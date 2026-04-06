import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ProAccessCard, useFeatureAccess } from '@/src/features/monetization';
import {
  MonthlyCompletionCard,
  ProfileInsightsSection,
  ProfileSectionCard,
  ProfileSummaryCard,
  WeeklyHeatmap,
  YearlyOverviewCard,
} from '@/src/features/profile/components';
import { useProfileScreen } from '@/src/features/profile/useProfileScreen';
import {
  useAccessibleProfileIds,
  useEntitlementSummary,
  useSelectedProfileSummary,
} from '@/src/state/selectors';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, OptionPills, Screen, StateMessageCard, Text } from '@/src/ui/base';

const BRUSHING_OPTIONS = [1, 2, 3] as const;
const FLOSS_FREQUENCY_OPTIONS = [1, 3, 7] as const;
const BOOLEAN_OPTIONS = [true, false] as const;
const LANGUAGE_OPTIONS = ['en', 'tr'] as const;
const THEME_OPTIONS = ['system', 'light', 'dark'] as const;
const MORNING_TIME_OPTIONS = ['07:00', '08:00', '08:30', '09:00'] as const;
const NIGHT_TIME_OPTIONS = ['20:30', '21:00', '21:30', '22:00'] as const;
const QUIET_START_OPTIONS = ['21:30', '22:00', '22:30', '23:00'] as const;
const QUIET_END_OPTIONS = ['07:00', '07:30', '08:00', '08:30'] as const;

export function ProfileScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const profileScreen = useProfileScreen();
  const { isPro } = useEntitlementSummary();
  const { selectedProfile } = useSelectedProfileSummary();
  const accessibleProfileIds = useAccessibleProfileIds();
  const hasAdvancedAnalyticsAccess = useFeatureAccess('analytics_advanced');
  const hasBiometricLockAccess = useFeatureAccess('biometric_lock');

  return (
    <Screen>
      <Text color="primary" variant="caption" weight="semibold">
        {t('profile.header.kicker')}
      </Text>
      <Text style={{ marginTop: theme.spacing.sm }} variant="display" weight="bold">
        {t('profile.header.title')}
      </Text>
      <Text color="muted" style={{ marginTop: theme.spacing.md }}>
        {t('profile.header.description')}
      </Text>

      <ProfileSummaryCard
        emptyBody={t('profile.preferences.noProfile')}
        showPreferences
        title={t('profile.preferences.title')}
      />

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text variant="title" weight="semibold">
          {t('profile.plan.title')}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {isPro ? t('profile.plan.proBody') : t('profile.plan.freeBody')}
        </Text>
        <Text color="primary" style={{ marginTop: theme.spacing.md }} weight="semibold">
          {isPro ? t('profile.plan.proLabel') : t('profile.plan.freeLabel')}
        </Text>
      </Card>

      {!isPro ? (
        <ProAccessCard
          featureKeys={[
            'tooth_map_full',
            'dentist_mode',
            'pdf_export',
            'analytics_advanced',
            'multi_profile',
          ]}
          title={t('profile.plan.unlockTitle')}
        />
      ) : null}

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text variant="title" weight="semibold">
          {t('profile.profiles.title')}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t('profile.profiles.body')}
        </Text>
        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
          {profileScreen.profiles.map((profile) => {
            const isSelected = profile.id === selectedProfile?.id;
            const isLocked = !accessibleProfileIds.includes(profile.id);

            return (
              <Card key={profile.id} style={{ padding: theme.spacing.lg }}>
                <Text weight="semibold">
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                  {isSelected
                    ? t('profile.profiles.current')
                    : isLocked
                      ? t('profile.profiles.locked')
                      : t('profile.profiles.available')}
                </Text>
                <View style={{ marginTop: theme.spacing.md }}>
                  {isLocked ? (
                    <Text color="muted">{t('profile.profiles.unlockHint')}</Text>
                  ) : (
                    <Button
                      onPress={() => void profileScreen.switchProfile(profile.id)}
                      title={
                        isSelected
                          ? t('profile.profiles.selectedAction')
                          : t('profile.profiles.switchAction')
                      }
                      variant={isSelected ? 'secondary' : 'primary'}
                    />
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      </Card>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text variant="title" weight="semibold">
          {t('profile.settings.title')}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t('profile.settings.body')}
        </Text>

        {profileScreen.settingsError ? (
          <StateMessageCard body={profileScreen.settingsError} title={t('common.errorTitle')} />
        ) : null}

        {profileScreen.settingsNotice ? (
          <StateMessageCard
            body={profileScreen.settingsNotice}
            title={t('profile.settings.savedTitle')}
          />
        ) : null}

        <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.lg }}>
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="caption" color="muted" weight="semibold">
              {t('profile.settings.language')}
            </Text>
            <OptionPills
              labelMap={(value) => t(`onboarding.languages.${value}`)}
              onSelect={(value) => void profileScreen.updateLanguage(value)}
              options={LANGUAGE_OPTIONS}
              selectedValue={profileScreen.language}
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="caption" color="muted" weight="semibold">
              {t('profile.settings.theme')}
            </Text>
            <OptionPills
              labelMap={(value) => t(`profile.settings.themeModes.${value}`)}
              onSelect={(value) => void profileScreen.updateThemeMode(value)}
              options={THEME_OPTIONS}
              selectedValue={profileScreen.themeMode}
            />
          </View>

          {profileScreen.routineSettings ? (
            <>
              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.brushingGoal')}
                </Text>
                <OptionPills
                  labelMap={(value) => t(`onboarding.brushingFrequency.${value}`)}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings(
                      { brushingFrequencyPerDay: value },
                      'brushing',
                    )
                  }
                  options={BRUSHING_OPTIONS}
                  selectedValue={profileScreen.routineSettings.brushingFrequencyPerDay as 1 | 2 | 3}
                />
              </View>

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.floss')}
                </Text>
                <OptionPills
                  labelMap={(value) => t(value ? 'common.enabled' : 'common.disabled')}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings({ flossingEnabled: value }, 'floss')
                  }
                  options={BOOLEAN_OPTIONS}
                  selectedValue={profileScreen.routineSettings.flossingEnabled}
                />
              </View>

              {profileScreen.routineSettings.flossingEnabled ? (
                <View style={{ gap: theme.spacing.sm }}>
                  <Text variant="caption" color="muted" weight="semibold">
                    {t('profile.settings.flossFrequency')}
                  </Text>
                  <OptionPills
                    labelMap={(value) => t(`onboarding.flossFrequencyOptions.${value}`)}
                    onSelect={(value) =>
                      void profileScreen.updateRoutineSettings(
                        { flossSessionsPerWeek: value },
                        'flossFrequency',
                      )
                    }
                    options={FLOSS_FREQUENCY_OPTIONS}
                    selectedValue={profileScreen.routineSettings.flossSessionsPerWeek}
                  />
                </View>
              ) : null}

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.mouthwash')}
                </Text>
                <OptionPills
                  labelMap={(value) => t(value ? 'common.enabled' : 'common.disabled')}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings({ mouthwashEnabled: value }, 'mouthwash')
                  }
                  options={BOOLEAN_OPTIONS}
                  selectedValue={profileScreen.routineSettings.mouthwashEnabled}
                />
              </View>

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.reminders')}
                </Text>
                <OptionPills
                  labelMap={(value) => t(value ? 'common.enabled' : 'common.disabled')}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings({ remindersEnabled: value }, 'reminders')
                  }
                  options={BOOLEAN_OPTIONS}
                  selectedValue={profileScreen.routineSettings.remindersEnabled}
                />
              </View>

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.morningReminder')}
                </Text>
                <OptionPills
                  labelMap={(value) => value}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings(
                      { morningReminderTime: value },
                      'morningReminder',
                    )
                  }
                  options={MORNING_TIME_OPTIONS}
                  selectedValue={profileScreen.routineSettings.morningReminderTime ?? '08:30'}
                />
              </View>

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.nightReminder')}
                </Text>
                <OptionPills
                  labelMap={(value) => value}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings(
                      { nightReminderTime: value, reminderTime: value },
                      'nightReminder',
                    )
                  }
                  options={NIGHT_TIME_OPTIONS}
                  selectedValue={profileScreen.routineSettings.nightReminderTime ?? '21:00'}
                />
              </View>

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.quietStart')}
                </Text>
                <OptionPills
                  labelMap={(value) => value}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings({ quietHoursStart: value }, 'quietStart')
                  }
                  options={QUIET_START_OPTIONS}
                  selectedValue={profileScreen.routineSettings.quietHoursStart ?? '22:30'}
                />
              </View>

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.quietEnd')}
                </Text>
                <OptionPills
                  labelMap={(value) => value}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings({ quietHoursEnd: value }, 'quietEnd')
                  }
                  options={QUIET_END_OPTIONS}
                  selectedValue={profileScreen.routineSettings.quietHoursEnd ?? '07:30'}
                />
              </View>
            </>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            <Button
              disabled={profileScreen.settingsBusyKey === 'notifications'}
              onPress={() => void profileScreen.requestNotificationPermission()}
              title={t('profile.settings.notificationsButton')}
              variant="secondary"
            />
            <Button
              disabled={
                profileScreen.settingsBusyKey === 'biometric' || !hasBiometricLockAccess
              }
              onPress={() =>
                hasBiometricLockAccess
                  ? void profileScreen.updateBiometricLock(
                      !profileScreen.appPreferences.biometricLockEnabled,
                    )
                  : undefined
              }
              title={
                hasBiometricLockAccess
                  ? profileScreen.appPreferences.biometricLockEnabled
                    ? t('profile.settings.biometricDisable')
                    : t('profile.settings.biometricEnable')
                  : t('profile.settings.biometricPro')
              }
              variant="secondary"
            />
            <Button
              disabled={profileScreen.settingsBusyKey === 'clearData'}
              onPress={() => void profileScreen.clearAllData()}
              title={t('profile.settings.clearData')}
              variant="ghost"
            />
          </View>
        </View>

        {!hasBiometricLockAccess ? (
          <ProAccessCard
            body={t('monetization.gates.biometricLock.body')}
            featureKeys={['biometric_lock']}
            title={t('monetization.gates.biometricLock.title')}
          />
        ) : null}
      </Card>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text variant="title" weight="semibold">
          {t('profile.release.title')}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t('profile.release.body')}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.md,
            marginTop: theme.spacing.lg,
          }}>
          <Button
            onPress={() => router.push('/privacy')}
            title={t('profile.release.privacy')}
            variant="secondary"
          />
          <Button
            onPress={() => router.push('/legal')}
            title={t('profile.release.terms')}
            variant="ghost"
          />
          <Button
            onPress={() => router.push('/permissions')}
            title={t('profile.release.permissions')}
            variant="ghost"
          />
        </View>
      </Card>

      <ProfileSectionCard
        description={t('profile.analytics.weeklyBody')}
        loading={profileScreen.loading && !profileScreen.error}
        loadingLabel={t('profile.loading')}
        title={t('profile.analytics.weeklyTitle')}>
        {profileScreen.error ? (
          <StateMessageCard
            actionLabel={t('common.retry')}
            body={profileScreen.error}
            onActionPress={() => void profileScreen.reload()}
            title={t('common.errorTitle')}
          />
        ) : (
          <WeeklyHeatmap cells={profileScreen.analytics.weeklyHeatmap} />
        )}
      </ProfileSectionCard>

      {hasAdvancedAnalyticsAccess ? (
        <>
          <ProfileSectionCard
            description={t('profile.analytics.monthlyBody')}
            loading={profileScreen.loading && !profileScreen.error}
            loadingLabel={t('profile.loading')}
            title={t('profile.analytics.monthlyTitle')}>
            {profileScreen.error ? (
              <StateMessageCard
                actionLabel={t('common.retry')}
                body={profileScreen.error}
                onActionPress={() => void profileScreen.reload()}
                title={t('common.errorTitle')}
              />
            ) : (
              <MonthlyCompletionCard metrics={profileScreen.analytics.monthlyCompletion} />
            )}
          </ProfileSectionCard>

          <ProfileSectionCard
            description={t('profile.analytics.yearlyBody')}
            loading={profileScreen.loading && !profileScreen.error}
            loadingLabel={t('profile.loading')}
            title={t('profile.analytics.yearlyTitle')}>
            {profileScreen.error ? (
              <StateMessageCard
                actionLabel={t('common.retry')}
                body={profileScreen.error}
                onActionPress={() => void profileScreen.reload()}
                title={t('common.errorTitle')}
              />
            ) : (
              <YearlyOverviewCard months={profileScreen.analytics.yearlyCompletion} />
            )}
          </ProfileSectionCard>

          <ProfileInsightsSection
            insights={profileScreen.analytics.insights}
            loading={profileScreen.loading && !profileScreen.error}
            loadingLabel={t('profile.loading')}
          />
        </>
      ) : (
        <ProAccessCard
          body={t('profile.analytics.proBody')}
          featureKeys={['analytics_advanced']}
          title={t('profile.analytics.proTitle')}
        />
      )}
    </Screen>
  );
}
