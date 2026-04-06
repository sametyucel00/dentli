import { useIsFocused } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { profileContextService } from '@/src/services';
import { useFocusedAsyncEffect } from '@/src/hooks/useFocusedAsyncEffect';
import { useAppLocale } from '@/src/i18n/useAppLocale';
import { EMPTY_PROFILE_ANALYTICS } from '@/src/features/profile/model';
import { profileService } from '@/src/features/profile/profile-service';
import { useAppStore } from '@/src/state/useAppStore';

const EMPTY_PROFILES: never[] = [];

export function useProfileScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const locale = useAppLocale();
  const selectedProfileId = useAppStore((state) => state.selectedProfileId);
  const profiles = useAppStore((state) => state.cache.profiles?.data ?? EMPTY_PROFILES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState(EMPTY_PROFILE_ANALYTICS);

  const reload = useCallback(async () => {
    if (!selectedProfileId) {
      setAnalytics(EMPTY_PROFILE_ANALYTICS);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setAnalytics(await profileService.loadAnalytics(selectedProfileId, locale));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [locale, selectedProfileId]);

  async function switchProfile(profileId: string) {
    setError(null);

    const didSwitch = await profileContextService.selectProfile(profileId);
    if (!didSwitch) {
      setError(t('profile.profiles.switchError'));
    }
  }

  useFocusedAsyncEffect(isFocused, reload);

  return {
    loading,
    error,
    profiles,
    selectedProfileId,
    analytics,
    reload,
    switchProfile,
  };
}
