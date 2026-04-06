import * as LocalAuthentication from 'expo-local-authentication';

import i18n from '@/src/i18n';
import { AppPreferences, RoutineSettings, SupportedLanguage, ThemeMode } from '@/src/domain/models';
import { nowIso } from '@/src/lib/runtime';
import { appPreferencesRepository, profileRepository, routineSettingsRepository } from '@/src/repositories';
import { appBootstrapService } from '@/src/services/app-bootstrap-service';
import { databaseService } from '@/src/services/database-service';
import { notificationSchedulerService } from '@/src/services/notification-scheduler-service';
import { notificationService } from '@/src/services/notification-service';
import { profileContextService } from '@/src/services/profile-context-service';
import { skipNextDevelopmentSeed } from '@/src/dev/seed-data';
import { useAppStore } from '@/src/state/useAppStore';

type RoutineSettingsPatch = Partial<
  Pick<
    RoutineSettings,
    | 'brushingFrequencyPerDay'
    | 'flossingEnabled'
    | 'flossSessionsPerWeek'
    | 'mouthwashEnabled'
    | 'remindersEnabled'
    | 'reminderTime'
    | 'morningReminderTime'
    | 'nightReminderTime'
    | 'quietHoursStart'
    | 'quietHoursEnd'
    | 'toothbrushReplacementIntervalDays'
    | 'toothbrushLastReplacedAt'
  >
>;

const DEFAULT_PREFERENCES: AppPreferences = {
  biometricLockEnabled: false,
  updatedAt: new Date(0).toISOString(),
};

class SettingsService {
  async applyLanguage(language: SupportedLanguage) {
    const state = useAppStore.getState();
    const previousLanguage = state.language;
    const cachedProfiles = state.cache.profiles?.data ?? [];
    state.setLanguage(language);

    const selectedProfileId = state.selectedProfileId;
    if (selectedProfileId && cachedProfiles.length > 0) {
      state.cacheProfiles(
        cachedProfiles.map((profile) =>
          profile.id === selectedProfileId
            ? { ...profile, preferredLanguage: language }
            : profile,
        ),
      );
    }

    try {
      await i18n.changeLanguage(language);

      if (selectedProfileId) {
        await profileRepository.updatePreferredLanguage(selectedProfileId, language);
      }
    } catch (error) {
      state.setLanguage(previousLanguage);

      if (selectedProfileId && cachedProfiles.length > 0) {
        state.cacheProfiles(cachedProfiles);
      }

      await i18n.changeLanguage(previousLanguage);
      throw error;
    }
  }

  setThemeMode(themeMode: ThemeMode) {
    useAppStore.getState().setThemeMode(themeMode);
  }

  toggleThemeMode() {
    useAppStore.getState().toggleThemeMode();
  }

  async updateRoutineSettings(profileId: string, patch: RoutineSettingsPatch) {
    const state = useAppStore.getState();
    const existing =
      state.cache.routineSettingsByProfileId[profileId]?.data ??
      (await routineSettingsRepository.getByProfileId(profileId));

    if (!existing) {
      throw new Error('Routine settings could not be loaded.');
    }

    const nextSettings: RoutineSettings = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    };

    state.cacheRoutineSettings(profileId, nextSettings);

    try {
      await routineSettingsRepository.upsert(nextSettings);
      await notificationSchedulerService.syncForProfile(profileId);
      return nextSettings;
    } catch (error) {
      state.cacheRoutineSettings(profileId, existing);
      throw error;
    }
  }

  async requestNotificationPermission() {
    await notificationService.initialize();
    return notificationService.requestPermissions();
  }

  async setBiometricLockEnabled(enabled: boolean) {
    if (enabled) {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);

      if (!hasHardware || !isEnrolled) {
        throw new Error(i18n.t('profile.settings.biometricUnavailable'));
      }
    }

    const previous = useAppStore.getState().appPreferences ?? DEFAULT_PREFERENCES;
    const nextPreferences: AppPreferences = {
      biometricLockEnabled: enabled,
      updatedAt: nowIso(),
    };

    useAppStore.getState().setAppPreferences(nextPreferences);

    try {
      await appPreferencesRepository.upsert(nextPreferences);
      return nextPreferences;
    } catch (error) {
      useAppStore.getState().setAppPreferences(previous);
      throw error;
    }
  }

  async clearAllData() {
    skipNextDevelopmentSeed();
    await notificationService.cancelAll();
    await databaseService.reset();
    useAppStore.getState().resetApp();
    appBootstrapService.resetInitialization();
    await appBootstrapService.initialize();
  }

  async restoreProfileContext() {
    const selectedProfileId = useAppStore.getState().selectedProfileId;
    await profileContextService.selectProfile(selectedProfileId);
  }
}

export const settingsService = new SettingsService();
