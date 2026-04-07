import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View, useWindowDimensions } from 'react-native';

import { ProAccessCard, useFeatureAccess } from '@/src/features/monetization';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import {
  MonthlyCompletionCard,
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
import { Button, Card, OptionPills, Screen, StateMessageCard, Text, TextField } from '@/src/ui/base';

const BRUSHING_OPTIONS = [1, 2] as const;
const FLOSS_FREQUENCY_OPTIONS = [1, 7] as const;
const MOUTHWASH_FREQUENCY_OPTIONS = [1, 7] as const;
const BOOLEAN_OPTIONS = [true, false] as const;
const LANGUAGE_OPTIONS = ['en', 'tr'] as const;
const THEME_OPTIONS = ['system', 'light', 'dark'] as const;
const MORNING_TIME_OPTIONS = ['07:00', '08:00', '09:00'] as const;
const NIGHT_TIME_OPTIONS = ['20:30', '21:00', '22:00'] as const;
const QUIET_START_OPTIONS = ['21:30', '22:00', '23:00'] as const;
const QUIET_END_OPTIONS = ['07:00', '08:00', '09:00'] as const;
const CENTERED_PILL_STYLE = { justifyContent: 'center' } as const;

export function ProfileScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { isExpanded, contentMaxWidth } = useResponsiveLayout();
  const isCompactWidth = width < 390;
  const isVeryNarrow = width < 350;
  const profileScreen = useProfileScreen();
  const { isPro } = useEntitlementSummary();
  const { selectedProfile } = useSelectedProfileSummary();
  const accessibleProfileIds = useAccessibleProfileIds();
  const hasAdvancedAnalyticsAccess = useFeatureAccess('analytics_advanced');
  const hasBiometricLockAccess = useFeatureAccess('biometric_lock');
  const actionButtonStyle = {
    flexBasis: isCompactWidth ? '48%' : '31%',
    flexGrow: 1,
    minWidth: 0,
  } as const;
  const profileButtonStyle = {
    flexBasis: isVeryNarrow ? '100%' : '48%',
    flexGrow: 1,
    minWidth: 0,
  } as const;

  function confirmClearAllData() {
    Alert.alert(
      t('profile.settings.clearDataConfirmTitle'),
      t('profile.settings.clearDataConfirmBody'),
      [
        {
          style: 'cancel',
          text: t('profile.settings.clearDataConfirmCancel'),
        },
        {
          style: 'destructive',
          text: t('profile.settings.clearDataConfirmConfirm'),
          onPress: () => void profileScreen.clearAllData(),
        },
      ],
    );
  }

  return (
    <Screen
      contentContainerStyle={{ paddingBottom: isPro ? theme.spacing.xxxxl * 1.5 : theme.spacing.xxxxl * 2 }}
      contentMaxWidth={contentMaxWidth}>
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

      <View style={{ flexDirection: isExpanded ? 'row' : 'column', gap: theme.spacing.lg }}>
        <View style={{ flex: isExpanded ? 1.1 : undefined }}>
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
        </View>

        <Card style={{ flex: isExpanded ? 0.9 : undefined, marginTop: theme.spacing.lg }}>
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
      </View>

      {!isPro ? (
        <ProAccessCard
          featureKeys={[
            'tooth_map_full',
            'dentist_mode',
            'pdf_export',
            'analytics_advanced',
            'multi_profile',
            'timeline_full',
            'care_full_inventory',
            'biometric_lock',
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
          <Card style={{ padding: theme.spacing.lg }}>
            <Text weight="semibold">{t('profile.profiles.addTitle')}</Text>
            <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
              {t('profile.profiles.addBody')}
            </Text>
            <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.md }}>
              <TextField
                onChangeText={profileScreen.setNewProfileFirstName}
                placeholder={t('onboarding.firstName')}
                value={profileScreen.newProfileFirstName}
              />
              <TextField
                onChangeText={profileScreen.setNewProfileLastName}
                placeholder={t('onboarding.lastName')}
                value={profileScreen.newProfileLastName}
              />
              {isPro ? (
                <Button
                  disabled={profileScreen.settingsBusyKey === 'createProfile'}
                  onPress={() => void profileScreen.createProfile()}
                  title={
                    profileScreen.settingsBusyKey === 'createProfile'
                      ? t('profile.profiles.creating')
                      : t('profile.profiles.addAction')
                  }
                />
              ) : (
                <Text color="muted">{t('profile.profiles.unlockHint')}</Text>
              )}
            </View>
          </Card>
          {profileScreen.profiles.map((profile) => {
            const isSelected = profile.id === selectedProfile?.id;
            const isLocked = !accessibleProfileIds.includes(profile.id);
            const canDelete = profileScreen.profiles.length > 1;

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
                    <View
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: theme.spacing.sm,
                      }}>
                      <Button
                        onPress={() => void profileScreen.switchProfile(profile.id)}
                        style={profileButtonStyle}
                        title={
                          isSelected
                            ? t('profile.profiles.selectedAction')
                            : t('profile.profiles.switchAction')
                        }
                        variant={isSelected ? 'secondary' : 'primary'}
                      />
                      {canDelete ? (
                        <Button
                          disabled={profileScreen.settingsBusyKey === `deleteProfile:${profile.id}`}
                          onPress={() => void profileScreen.deleteProfile(profile.id)}
                          style={profileButtonStyle}
                          title={t('profile.profiles.deleteAction')}
                          variant="ghost"
                        />
                      ) : (
                        <Text color="muted" style={{ lineHeight: 20, minHeight: 48 }}>
                          {t('profile.profiles.keepOne')}
                        </Text>
                      )}
                    </View>
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
              containerStyle={CENTERED_PILL_STYLE}
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
              containerStyle={CENTERED_PILL_STYLE}
              labelMap={(value) => t(`profile.settings.themeModes.${value}`)}
              onSelect={(value) => void profileScreen.updateThemeMode(value)}
              options={THEME_OPTIONS}
              selectedValue={profileScreen.themeMode}
            />
          </View>

          {profileScreen.routineSettings ? (
            <Card style={{ padding: theme.spacing.lg }}>
              <View style={{ gap: theme.spacing.lg }}>
              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.brushingGoal')}
                </Text>
                <OptionPills
                  containerStyle={CENTERED_PILL_STYLE}
                  labelMap={(value) => t(`onboarding.brushingFrequency.${value}`)}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings(
                      { brushingFrequencyPerDay: value },
                      'brushing',
                    )
                  }
                  options={BRUSHING_OPTIONS}
                  selectedValue={profileScreen.routineSettings.brushingFrequencyPerDay as 1 | 2}
                />
              </View>

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.floss')}
                </Text>
                <OptionPills
                  containerStyle={CENTERED_PILL_STYLE}
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
                    containerStyle={CENTERED_PILL_STYLE}
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
                  containerStyle={CENTERED_PILL_STYLE}
                  labelMap={(value) => t(value ? 'common.enabled' : 'common.disabled')}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings({ mouthwashEnabled: value }, 'mouthwash')
                  }
                  options={BOOLEAN_OPTIONS}
                  selectedValue={profileScreen.routineSettings.mouthwashEnabled}
                />
              </View>

              {profileScreen.routineSettings.mouthwashEnabled ? (
                <View style={{ gap: theme.spacing.sm }}>
                  <Text variant="caption" color="muted" weight="semibold">
                    {t('profile.settings.mouthwashFrequency')}
                  </Text>
                  <OptionPills
                    containerStyle={CENTERED_PILL_STYLE}
                    labelMap={(value) => t(`onboarding.flossFrequencyOptions.${value}`)}
                    onSelect={(value) =>
                      void profileScreen.updateRoutineSettings(
                        { mouthwashSessionsPerWeek: value },
                        'mouthwashFrequency',
                      )
                    }
                    options={MOUTHWASH_FREQUENCY_OPTIONS}
                    selectedValue={profileScreen.routineSettings.mouthwashSessionsPerWeek}
                  />
                </View>
              ) : null}

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.reminders')}
                </Text>
                <OptionPills
                  containerStyle={CENTERED_PILL_STYLE}
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
                  containerStyle={CENTERED_PILL_STYLE}
                  labelMap={(value) => value}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings(
                      { morningReminderTime: value },
                      'morningReminder',
                    )
                  }
                  options={MORNING_TIME_OPTIONS}
                  selectedValue={profileScreen.routineSettings.morningReminderTime ?? '08:00'}
                />
              </View>

              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="caption" color="muted" weight="semibold">
                  {t('profile.settings.nightReminder')}
                </Text>
                <OptionPills
                  containerStyle={CENTERED_PILL_STYLE}
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
                  containerStyle={CENTERED_PILL_STYLE}
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
                  containerStyle={CENTERED_PILL_STYLE}
                  labelMap={(value) => value}
                  onSelect={(value) =>
                    void profileScreen.updateRoutineSettings({ quietHoursEnd: value }, 'quietEnd')
                  }
                  options={QUIET_END_OPTIONS}
                  selectedValue={profileScreen.routineSettings.quietHoursEnd ?? '08:00'}
                />
              </View>
              </View>
            </Card>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.spacing.md,
              justifyContent: 'center',
            }}>
            <Button
              compact
              disabled={profileScreen.settingsBusyKey === 'notifications'}
              onPress={() => void profileScreen.requestNotificationPermission()}
              style={profileButtonStyle}
              title={t('profile.settings.notificationsButton')}
              titleVariant="caption"
              variant="secondary"
            />
            <Button
              compact
              disabled={profileScreen.settingsBusyKey === 'clearData'}
              onPress={confirmClearAllData}
              style={profileButtonStyle}
              title={t('profile.settings.clearData')}
              titleVariant="caption"
              variant="secondary"
            />
          </View>
        </View>

      </Card>

      {hasBiometricLockAccess ? (
        <Card style={{ marginTop: theme.spacing.lg }}>
          <Text variant="title" weight="semibold">
            {t('profile.settings.biometricEnable')}
          </Text>
          <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
            {t('profile.settings.biometricBody')}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: theme.spacing.lg,
            }}>
            <Button
              compact
              disabled={profileScreen.settingsBusyKey === 'biometric'}
              onPress={() =>
                void profileScreen.updateBiometricLock(
                  !profileScreen.appPreferences.biometricLockEnabled,
                )
              }
              style={{ minWidth: 240 }}
              titleVariant="caption"
              title={
                profileScreen.appPreferences.biometricLockEnabled
                  ? t('profile.settings.biometricDisable')
                  : t('profile.settings.biometricEnable')
              }
              variant="secondary"
            />
          </View>
        </Card>
      ) : null}

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
            justifyContent: 'center',
            marginTop: theme.spacing.lg,
          }}>
          <Button
            compact
            onPress={() => router.push('/privacy')}
            style={actionButtonStyle}
            title={t('profile.release.privacy')}
            titleVariant="caption"
            variant="secondary"
          />
          <Button
            compact
            onPress={() => router.push('/legal')}
            style={actionButtonStyle}
            title={t('profile.release.terms')}
            titleVariant="caption"
            variant="secondary"
          />
          <Button
            compact
            onPress={() => router.push('/permissions')}
            style={actionButtonStyle}
            title={t('profile.release.permissions')}
            titleVariant="caption"
            variant="secondary"
          />
          <Button
            compact
            onPress={() => router.push('/support' as Href)}
            style={actionButtonStyle}
            title={t('profile.release.support')}
            titleVariant="caption"
            variant="secondary"
          />
        </View>
      </Card>

      {hasAdvancedAnalyticsAccess ? (
        <>
          <View style={{ flexDirection: isExpanded ? 'row' : 'column', gap: theme.spacing.lg }}>
            <View style={{ flex: isExpanded ? 1 : undefined }}>
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
            </View>

            <View style={{ flex: isExpanded ? 1 : undefined }}>
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
            </View>
          </View>
        </>
      ) : null}
    </Screen>
  );
}
