import i18n from '@/src/i18n';
import { SupportedLanguage, ThemeMode } from '@/src/domain/models';
import { profileRepository } from '@/src/repositories';
import { useAppStore } from '@/src/state/useAppStore';

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
}

export const settingsService = new SettingsService();
