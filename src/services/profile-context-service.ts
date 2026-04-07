import {
  appointmentsRepository,
  careItemsRepository,
  profileRepository,
  routineSettingsRepository,
  toothStatusRepository,
} from '@/src/repositories';
import { entitlementService } from '@/src/services/entitlement-service';
import { notificationSchedulerService } from '@/src/services/notification-scheduler-service';
import { useAppStore } from '@/src/state/useAppStore';

class ProfileContextService {
  private clearSelectedProfileContext() {
    useAppStore.getState().setSelectedProfileContext({
      selectedProfileId: null,
      routineSettings: null,
      appointments: [],
      careItems: [],
      toothCurrentStatuses: [],
    });
  }

  async loadProfileContext(profileId: string) {
    const [profile, routineSettings, appointments, careItems, toothCurrentStatuses] =
      await Promise.all([
        profileRepository.getById(profileId),
        routineSettingsRepository.getByProfileId(profileId),
        appointmentsRepository.listByProfileId(profileId),
        careItemsRepository.listByProfileId(profileId),
        toothStatusRepository.listCurrentByProfileId(profileId),
      ]);

    return {
      profile,
      routineSettings,
      appointments,
      careItems,
      toothCurrentStatuses,
    };
  }

  async selectProfile(
    profileId: string | null,
    options?: {
      deferNotificationSync?: boolean;
    },
  ) {
    const cachedProfiles = useAppStore.getState().cache.profiles?.data ?? [];
    const profiles =
      cachedProfiles.length > 0 ? cachedProfiles : await profileRepository.list();
    useAppStore.getState().cacheProfiles(profiles);
    const profileIds = profiles.map((profile) => profile.id);

    if (!entitlementService.canAccessProfile(profileId, profileIds)) {
      const fallbackProfileId = entitlementService.getFallbackProfileId(profileIds);
      if (fallbackProfileId === null) {
        this.clearSelectedProfileContext();
        return false;
      }

      profileId = fallbackProfileId;
    }

    if (!profileId) {
      this.clearSelectedProfileContext();
      return true;
    }

    const { profile, routineSettings, appointments, careItems, toothCurrentStatuses } =
      await this.loadProfileContext(profileId);

    if (!profile) {
      this.clearSelectedProfileContext();
      return false;
    }

    useAppStore.getState().setSelectedProfileContext({
      selectedProfileId: profileId,
      routineSettings,
      appointments,
      careItems,
      toothCurrentStatuses,
      language: profile?.preferredLanguage,
    });

    if (options?.deferNotificationSync) {
      void notificationSchedulerService.syncForProfile(profileId).catch(() => undefined);
    } else {
      await notificationSchedulerService.syncForProfile(profileId);
    }

    return true;
  }
}

export const profileContextService = new ProfileContextService();
