import { AppPreferences } from '@/src/domain/models';
import { toBoolean, toSqliteBoolean } from '@/src/lib/value-transforms';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type AppPreferencesRow = {
  biometric_lock_enabled: number;
  theme_mode: AppPreferences['themeMode'];
  onboarding_completed: number;
  updated_at: string;
};

function mapPreferences(row: AppPreferencesRow): AppPreferences {
  return {
    biometricLockEnabled: toBoolean(row.biometric_lock_enabled),
    themeMode: row.theme_mode,
    onboardingCompleted: toBoolean(row.onboarding_completed),
    updatedAt: row.updated_at,
  };
}

export class AppPreferencesRepository extends BaseRepository {
  async get() {
    const row = await this.database.getFirst<AppPreferencesRow>(
      `SELECT biometric_lock_enabled, theme_mode, onboarding_completed, updated_at
       FROM app_preferences
       WHERE id = 1
       LIMIT 1;`,
    );

    return row ? mapPreferences(row) : null;
  }

  async upsert(preferences: AppPreferences) {
    await this.database.run(
      `INSERT INTO app_preferences (id, biometric_lock_enabled, theme_mode, onboarding_completed, updated_at)
       VALUES (1, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         biometric_lock_enabled = excluded.biometric_lock_enabled,
         theme_mode = excluded.theme_mode,
         onboarding_completed = excluded.onboarding_completed,
         updated_at = excluded.updated_at;`,
      [
        toSqliteBoolean(preferences.biometricLockEnabled),
        preferences.themeMode,
        toSqliteBoolean(preferences.onboardingCompleted),
        preferences.updatedAt,
      ],
    );
  }
}

export const appPreferencesRepository = new AppPreferencesRepository(databaseService);
