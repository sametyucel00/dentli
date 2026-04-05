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
import { Button, Card, Screen, StateMessageCard, Text } from '@/src/ui/base';

export function ProfileScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const profileScreen = useProfileScreen();
  const { isPro } = useEntitlementSummary();
  const { selectedProfile } = useSelectedProfileSummary();
  const accessibleProfileIds = useAccessibleProfileIds();
  const hasAdvancedAnalyticsAccess = useFeatureAccess('analytics_advanced');

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
