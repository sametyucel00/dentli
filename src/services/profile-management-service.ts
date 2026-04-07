import { Profile, RoutineSettings, SupportedLanguage } from '@/src/domain/models';
import i18n from '@/src/i18n';
import { createId, nowIso } from '@/src/lib/runtime';
import {
  appointmentsRepository,
  profileRepository,
  routineSettingsRepository,
} from '@/src/repositories';
import { databaseService } from '@/src/services/database-service';
import { entitlementService } from '@/src/services/entitlement-service';
import { notificationService } from '@/src/services/notification-service';
import { profileContextService } from '@/src/services/profile-context-service';

type CreateProfileInput = {
  firstName: string;
  lastName: string;
  preferredLanguage: SupportedLanguage;
};

function createDefaultRoutineSettings(profileId: string, source: RoutineSettings | null, timestamp: string) {
  return {
    id: createId('routine'),
    profileId,
    brushingFrequencyPerDay: source?.brushingFrequencyPerDay ?? 2,
    flossingEnabled: source?.flossingEnabled ?? true,
    flossSessionsPerWeek: source?.flossSessionsPerWeek ?? 1,
    mouthwashEnabled: source?.mouthwashEnabled ?? false,
    mouthwashSessionsPerWeek: source?.mouthwashSessionsPerWeek ?? 1,
    remindersEnabled: source?.remindersEnabled ?? true,
    reminderTime: source?.reminderTime ?? '21:00',
    morningReminderTime: source?.morningReminderTime ?? '08:00',
    nightReminderTime: source?.nightReminderTime ?? '21:00',
    quietHoursStart: source?.quietHoursStart ?? '22:30',
    quietHoursEnd: source?.quietHoursEnd ?? '08:00',
    toothbrushReplacementIntervalDays: source?.toothbrushReplacementIntervalDays ?? 90,
    toothbrushLastReplacedAt: source?.toothbrushLastReplacedAt ?? timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies RoutineSettings;
}

class ProfileManagementService {
  async createProfile(input: CreateProfileInput) {
    const profiles = await profileRepository.list();
    const profileIds = profiles.map((profile) => profile.id);

    if (!entitlementService.hasFeature('multi_profile') && profiles.length >= 1) {
      throw new Error(i18n.t('profile.profiles.unlockHint'));
    }

    const timestamp = nowIso();
    const profileId = createId('profile');
    const profile: Profile = {
      id: profileId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      preferredLanguage: input.preferredLanguage,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const sourceRoutineSettings =
      profiles.length > 0 ? await routineSettingsRepository.getByProfileId(profileIds[0] ?? '') : null;
    const routineSettings = createDefaultRoutineSettings(profileId, sourceRoutineSettings, timestamp);

    await databaseService.withTransaction(async () => {
      await profileRepository.create(profile);
      await routineSettingsRepository.upsert(routineSettings);
    });

    await profileContextService.selectProfile(profileId);
    return profile;
  }

  async deleteProfile(profileId: string) {
    const profiles = await profileRepository.list();
    if (profiles.length <= 1) {
      throw new Error(i18n.t('profile.profiles.keepOne'));
    }

    const appointments = await appointmentsRepository.listByProfileId(profileId);

    for (const appointment of appointments) {
      if (appointment.reminderNotificationId) {
        await notificationService.cancel(appointment.reminderNotificationId);
      }
    }

    await notificationService.cancelByPrefix(`routine_${profileId}_`);
    await notificationService.cancelByPrefix(`care_${profileId}_`);
    await notificationService.cancelByPrefix(`dental_${profileId}_`);

    await profileRepository.deleteById(profileId);

    const remainingProfiles = await profileRepository.list();
    const fallbackProfileId = remainingProfiles[0]?.id ?? null;
    await profileContextService.selectProfile(fallbackProfileId);
  }
}

export const profileManagementService = new ProfileManagementService();
