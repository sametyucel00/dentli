import { seedDevelopmentData } from '@/src/dev/seed-data';
import { profileRepository } from '@/src/repositories';
import { appPreferencesRepository } from '@/src/repositories/app-preferences-repository';
import { databaseService } from '@/src/services/database-service';
import { entitlementService } from '@/src/services/entitlement-service';
import { notificationSchedulerService } from '@/src/services/notification-scheduler-service';
import { notificationService } from '@/src/services/notification-service';
import { profileContextService } from '@/src/services/profile-context-service';
import { useAppStore } from '@/src/state/useAppStore';

class AppBootstrapService {
  private initializationPromise: Promise<void> | null = null;

  async initialize() {
    if (!this.initializationPromise) {
      this.initializationPromise = this.runInitialization().catch((error) => {
        this.initializationPromise = null;
        throw error;
      });
    }

    return this.initializationPromise;
  }

  async hydrateStore() {
    const [profiles, entitlements, storedPreferences] = await Promise.all([
      profileRepository.list(),
      entitlementService.loadSnapshot(),
      appPreferencesRepository.get(),
    ]);
    const appPreferences = storedPreferences ?? {
      biometricLockEnabled: false,
      themeMode: 'dark',
      onboardingCompleted: false,
      updatedAt: new Date().toISOString(),
    };
    const preferredSelectedProfileId =
      useAppStore.getState().selectedProfileId ?? profiles[0]?.id ?? null;
    const profileIds = profiles.map((profile) => profile.id);
    const resolvedProfileId = entitlementService.canAccessProfile(
      preferredSelectedProfileId,
      profileIds,
    )
      ? preferredSelectedProfileId
      : entitlementService.getFallbackProfileId(profileIds);
    const profileContext = resolvedProfileId
      ? await profileContextService.loadProfileContext(resolvedProfileId)
      : null;

    useAppStore.getState().hydrate({
      profiles,
      selectedProfileId: resolvedProfileId,
      routineSettings: profileContext?.routineSettings ?? null,
      appointments: profileContext?.appointments ?? [],
      careItems: profileContext?.careItems ?? [],
      toothCurrentStatuses: profileContext?.toothCurrentStatuses ?? [],
      entitlements,
      appPreferences,
    });

    if (profileContext?.profile) {
      void notificationSchedulerService.syncForProfile(profileContext.profile.id).catch(() => undefined);
      return;
    }

    if (resolvedProfileId) {
      const didSelectProfile = await profileContextService.selectProfile(resolvedProfileId, {
        deferNotificationSync: true,
      });

      if (didSelectProfile) {
        return;
      }
    }

    useAppStore.getState().selectProfile(null);
  }

  resetInitialization() {
    this.initializationPromise = null;
  }

  private async runInitialization() {
    useAppStore.getState().setBootstrapState({ status: 'loading' });

    try {
      await databaseService.initialize();
      await this.hydrateStore();
      void seedDevelopmentData().catch(() => undefined);
      void notificationService.initialize().catch(() => undefined);
    } catch (error) {
      useAppStore.getState().setBootstrapState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown bootstrap error',
      });
      throw error;
    }
  }
}

export const appBootstrapService = new AppBootstrapService();
