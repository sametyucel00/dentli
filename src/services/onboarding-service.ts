import { Profile, RoutineSettings, SupportedLanguage } from '@/src/domain/models';
import { createId, nowIso } from '@/src/lib/runtime';
import { appPreferencesRepository, profileRepository, routineSettingsRepository } from '@/src/repositories';
import { databaseService } from '@/src/services/database-service';
import { notificationService } from '@/src/services/notification-service';
import { profileContextService } from '@/src/services/profile-context-service';
import { settingsService } from '@/src/services/settings-service';

type CreateInitialProfileInput = {
  firstName: string;
  lastName: string;
  preferredLanguage: SupportedLanguage;
  brushingFrequencyPerDay: 1 | 2;
  flossingEnabled: boolean;
  flossSessionsPerWeek: number;
  mouthwashEnabled: boolean;
  mouthwashSessionsPerWeek: number;
  remindersEnabled: boolean;
  morningReminderTime: string;
  nightReminderTime: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  requestNotificationPermission: boolean;
};

class OnboardingService {
  async createInitialProfile(input: CreateInitialProfileInput) {
    const timestamp = nowIso();
    const profileId = createId('profile');

    const profile: Profile = {
      id: profileId,
      firstName: input.firstName,
      lastName: input.lastName,
      preferredLanguage: 'en',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const routineSettings: RoutineSettings = {
      id: createId('routine'),
      profileId,
      brushingFrequencyPerDay: input.brushingFrequencyPerDay,
      flossingEnabled: input.flossingEnabled,
      flossSessionsPerWeek: input.flossSessionsPerWeek,
      mouthwashEnabled: input.mouthwashEnabled,
      mouthwashSessionsPerWeek: input.mouthwashSessionsPerWeek,
      remindersEnabled: input.remindersEnabled,
      reminderTime: input.nightReminderTime,
      morningReminderTime: input.morningReminderTime,
      nightReminderTime: input.nightReminderTime,
      quietHoursStart: input.quietHoursStart,
      quietHoursEnd: input.quietHoursEnd,
      toothbrushReplacementIntervalDays: 90,
      toothbrushLastReplacedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await databaseService.withTransaction(async () => {
      await profileRepository.create(profile);
      await routineSettingsRepository.upsert(routineSettings);
      await appPreferencesRepository.upsert({
        biometricLockEnabled: false,
        themeMode: 'dark',
        onboardingCompleted: true,
        updatedAt: timestamp,
      });
    });

    await settingsService.applyLanguage('en');
    await profileContextService.selectProfile(profileId);

    if (input.requestNotificationPermission && input.remindersEnabled) {
      await notificationService.initialize();
      await notificationService.requestPermissions();
    }
  }
}

export const onboardingService = new OnboardingService();
