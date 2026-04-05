import { RoutineSettings } from '@/src/domain/models';
import { toBoolean, toSqliteBoolean } from '@/src/lib/value-transforms';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type RoutineSettingsRow = {
  id: string;
  profile_id: string;
  brushing_frequency_per_day: number;
  flossing_enabled: number;
  mouthwash_enabled: number;
  reminders_enabled: number;
  reminder_time: string | null;
  toothbrush_replacement_interval_days: number;
  toothbrush_last_replaced_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRoutineSettings(row: RoutineSettingsRow): RoutineSettings {
  return {
    id: row.id,
    profileId: row.profile_id,
    brushingFrequencyPerDay: row.brushing_frequency_per_day,
    flossingEnabled: toBoolean(row.flossing_enabled),
    mouthwashEnabled: toBoolean(row.mouthwash_enabled),
    remindersEnabled: toBoolean(row.reminders_enabled),
    reminderTime: row.reminder_time,
    toothbrushReplacementIntervalDays: row.toothbrush_replacement_interval_days,
    toothbrushLastReplacedAt: row.toothbrush_last_replaced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class RoutineSettingsRepository extends BaseRepository {
  async getByProfileId(profileId: string) {
    const row = await this.database.getFirst<RoutineSettingsRow>(
      `SELECT * FROM routine_settings WHERE profile_id = ? LIMIT 1;`,
      [profileId],
    );

    return row ? mapRoutineSettings(row) : null;
  }

  async upsert(settings: RoutineSettings) {
    await this.database.run(
      `INSERT INTO routine_settings (
        id, profile_id, brushing_frequency_per_day, flossing_enabled, mouthwash_enabled,
        reminders_enabled, reminder_time, toothbrush_replacement_interval_days,
        toothbrush_last_replaced_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id) DO UPDATE SET
        brushing_frequency_per_day = excluded.brushing_frequency_per_day,
        flossing_enabled = excluded.flossing_enabled,
        mouthwash_enabled = excluded.mouthwash_enabled,
        reminders_enabled = excluded.reminders_enabled,
        reminder_time = excluded.reminder_time,
        toothbrush_replacement_interval_days = excluded.toothbrush_replacement_interval_days,
        toothbrush_last_replaced_at = excluded.toothbrush_last_replaced_at,
        updated_at = excluded.updated_at;`,
      [
        settings.id,
        settings.profileId,
        settings.brushingFrequencyPerDay,
        toSqliteBoolean(settings.flossingEnabled),
        toSqliteBoolean(settings.mouthwashEnabled),
        toSqliteBoolean(settings.remindersEnabled),
        settings.reminderTime,
        settings.toothbrushReplacementIntervalDays,
        settings.toothbrushLastReplacedAt,
        settings.createdAt,
        settings.updatedAt,
      ],
    );
  }
}

export const routineSettingsRepository = new RoutineSettingsRepository(databaseService);
