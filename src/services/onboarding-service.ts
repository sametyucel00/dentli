import { Profile, RoutineSettings, SupportedLanguage } from '@/src/domain/models';
import { createId, nowIso } from '@/src/lib/runtime';
import { profileRepository, routineSettingsRepository } from '@/src/repositories';
import { databaseService } from '@/src/services/database-service';
import { profileContextService } from '@/src/services/profile-context-service';

type CreateInitialProfileInput = {
  firstName: string;
  lastName: string;
  preferredLanguage: SupportedLanguage;
};

class OnboardingService {
  async createInitialProfile(input: CreateInitialProfileInput) {
    const timestamp = nowIso();
    const profileId = createId('profile');

    const profile: Profile = {
      id: profileId,
      firstName: input.firstName,
      lastName: input.lastName,
      preferredLanguage: input.preferredLanguage,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const routineSettings: RoutineSettings = {
      id: createId('routine'),
      profileId,
      brushingFrequencyPerDay: 2,
      flossingEnabled: true,
      mouthwashEnabled: true,
      remindersEnabled: true,
      reminderTime: '21:00',
      toothbrushReplacementIntervalDays: 90,
      toothbrushLastReplacedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await databaseService.withTransaction(async () => {
      await profileRepository.create(profile);
      await routineSettingsRepository.upsert(routineSettings);
    });

    await profileContextService.selectProfile(profileId);
  }
}

export const onboardingService = new OnboardingService();
