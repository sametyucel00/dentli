import { useIsFocused } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { profileContextService, profileManagementService, settingsService } from '@/src/services';
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
  const routineSettings = useAppStore((state) =>
    state.selectedProfileId
      ? state.cache.routineSettingsByProfileId[state.selectedProfileId]?.data ?? null
      : null,
  );
  const appPreferences = useAppStore((state) => state.appPreferences);
  const themeMode = useAppStore((state) => state.themeMode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);
  const [settingsBusyKey, setSettingsBusyKey] = useState<string | null>(null);
  const [newProfileFirstName, setNewProfileFirstName] = useState('');
  const [newProfileLastName, setNewProfileLastName] = useState('');
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
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [locale, selectedProfileId]);

  async function runSettingsAction(
    busyKey: string,
    action: () => Promise<void>,
    successMessage?: string,
  ) {
    setSettingsBusyKey(busyKey);
    setSettingsError(null);
    setSettingsNotice(null);

    try {
      await action();
      if (successMessage) {
        setSettingsNotice(successMessage);
      }
    } catch (nextError) {
      setSettingsError(
        nextError instanceof Error ? nextError.message : t('profile.settings.saveError'),
      );
    } finally {
      setSettingsBusyKey(null);
    }
  }

  async function switchProfile(profileId: string) {
    setError(null);

    const didSwitch = await profileContextService.selectProfile(profileId);
    if (!didSwitch) {
      setError(t('profile.profiles.switchError'));
    }
  }

  async function updateThemeMode(nextThemeMode: 'system' | 'light' | 'dark') {
    await runSettingsAction(
      'theme',
      async () => {
        await settingsService.setThemeMode(nextThemeMode);
      },
      t('profile.settings.saved'),
    );
  }

  async function updateRoutineSettings(
    patch: Parameters<typeof settingsService.updateRoutineSettings>[1],
    busyKey = 'routine',
  ) {
    if (!selectedProfileId) {
      return;
    }

    await runSettingsAction(
      busyKey,
      async () => {
        await settingsService.updateRoutineSettings(selectedProfileId, patch);
        await reload();
      },
      t('profile.settings.saved'),
    );
  }

  async function requestNotificationPermission() {
    await runSettingsAction(
      'notifications',
      async () => {
        const granted = await settingsService.requestNotificationPermission();
        if (!granted) {
          throw new Error(t('profile.settings.notificationDenied'));
        }
      },
      t('profile.settings.notificationsGranted'),
    );
  }

  async function updateBiometricLock(enabled: boolean) {
    await runSettingsAction(
      'biometric',
      async () => {
        await settingsService.setBiometricLockEnabled(enabled);
      },
      enabled ? t('profile.settings.biometricEnabled') : t('profile.settings.biometricDisabled'),
    );
  }

  async function clearAllData() {
    await runSettingsAction(
      'clearData',
      async () => {
        await settingsService.clearAllData();
      },
      t('profile.settings.dataCleared'),
    );
  }

  async function createProfile() {
    const firstName = newProfileFirstName.trim();
    if (!firstName) {
      setSettingsError(t('profile.profiles.firstNameRequired'));
      return;
    }

    await runSettingsAction(
      'createProfile',
      async () => {
        await profileManagementService.createProfile({
          firstName,
          lastName: newProfileLastName.trim(),
          preferredLanguage: 'en',
        });
        setNewProfileFirstName('');
        setNewProfileLastName('');
        await reload();
      },
      t('profile.profiles.created'),
    );
  }

  async function deleteProfile(profileId: string) {
    await runSettingsAction(
      `deleteProfile:${profileId}`,
      async () => {
        await profileManagementService.deleteProfile(profileId);
        await reload();
      },
      t('profile.profiles.deleted'),
    );
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
    routineSettings,
    appPreferences,
    themeMode,
    settingsError,
    settingsNotice,
    settingsBusyKey,
    newProfileFirstName,
    setNewProfileFirstName,
    newProfileLastName,
    setNewProfileLastName,
    updateThemeMode,
    updateRoutineSettings,
    requestNotificationPermission,
    updateBiometricLock,
    clearAllData,
    createProfile,
    deleteProfile,
  };
}
