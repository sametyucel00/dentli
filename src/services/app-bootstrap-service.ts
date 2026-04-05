import { seedDevelopmentData } from '@/src/dev/seed-data';
import { profileRepository } from '@/src/repositories';
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
    const preferredSelectedProfileId = useAppStore.getState().selectedProfileId ?? profiles[0]?.id ?? null;

    useAppStore.getState().hydrate({
      profiles,
      selectedProfileId: preferredSelectedProfileId,
      routineSettings: null,
      appointments: [],
      careItems: [],
      toothCurrentStatuses: [],
      entitlements,
    });

    const didSelectProfile = await profileContextService.selectProfile(preferredSelectedProfileId);

    if (!didSelectProfile) {
      const fallbackProfileId = profiles[0]?.id ?? null;
      useAppStore.getState().selectProfile(fallbackProfileId);
      await profileContextService.selectProfile(fallbackProfileId);
    }
  }

  private async runInitialization() {
    useAppStore.getState().setBootstrapState({ status: 'loading' });

    try {
      await databaseService.initialize();
      await seedDevelopmentData();
      await notificationService.initialize();
      await this.hydrateStore();
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
