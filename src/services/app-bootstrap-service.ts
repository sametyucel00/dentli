import { seedDevelopmentData } from '@/src/dev/seed-data';
import { profileRepository } from '@/src/repositories';
import { appPreferencesRepository } from '@/src/repositories/app-preferences-repository';
import { databaseService } from '@/src/services/database-service';
import { entitlementService } from '@/src/services/entitlement-service';
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
    const profiles = await profileRepository.list();
    const entitlements = await entitlementService.loadSnapshot();
    const appPreferences = (await appPreferencesRepository.get()) ?? {
      biometricLockEnabled: false,
      themeMode: 'dark',
      onboardingCompleted: false,
      updatedAt: new Date().toISOString(),
    };
    const preferredSelectedProfileId = useAppStore.getState().selectedProfileId ?? profiles[0]?.id ?? null;

    useAppStore.getState().hydrate({
      profiles,
      selectedProfileId: preferredSelectedProfileId,
      routineSettings: null,
      appointments: [],
      careItems: [],
      toothCurrentStatuses: [],
      entitlements,
      appPreferences,
    });

    const didSelectProfile = await profileContextService.selectProfile(preferredSelectedProfileId);

    if (!didSelectProfile) {
      const fallbackProfileId = profiles[0]?.id ?? null;
      useAppStore.getState().selectProfile(fallbackProfileId);
      await profileContextService.selectProfile(fallbackProfileId);
    }
  }

  resetInitialization() {
    this.initializationPromise = null;
  }

  private async runInitialization() {
    useAppStore.getState().setBootstrapState({ status: 'loading' });

    try {
      await databaseService.initialize();
      await seedDevelopmentData();
      await this.hydrateStore();
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
