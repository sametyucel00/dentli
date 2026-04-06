import { RoutineSettings } from '@/src/domain/models';
import { toBoolean, toSqliteBoolean } from '@/src/lib/value-transforms';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type RoutineSettingsRow = {
  id: string;
  profile_id: string;
  brushing_frequency_per_day: number;
  flossing_enabled: number;
  floss_sessions_per_week: number;
  mouthwash_enabled: number;
  mouthwash_sessions_per_week: number;
  reminders_enabled: number;
  reminder_time: string | null;
  morning_reminder_time: string | null;
  night_reminder_time: string | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  toothbrush_replacement_interval_days: number;
  toothbrush_last_replaced_at: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeBrushingFrequency(value: number) {
  return value >= 2 ? 2 : 1;
}

function normalizeWeeklySessions(value: number) {
  return value >= 7 ? 7 : 1;
}

function normalizeTimeValue(value: string | null, allowedValues: readonly string[], fallback: string) {
  if (!value) {
    return fallback;
  }

  return allowedValues.includes(value) ? value : fallback;
}

function mapRoutineSettings(row: RoutineSettingsRow): RoutineSettings {
  return {
    id: row.id,
    profileId: row.profile_id,
    brushingFrequencyPerDay: normalizeBrushingFrequency(row.brushing_frequency_per_day),
    flossingEnabled: toBoolean(row.flossing_enabled),
    flossSessionsPerWeek: normalizeWeeklySessions(row.floss_sessions_per_week),
    mouthwashEnabled: toBoolean(row.mouthwash_enabled),
    mouthwashSessionsPerWeek: normalizeWeeklySessions(row.mouthwash_sessions_per_week),
    remindersEnabled: toBoolean(row.reminders_enabled),
    reminderTime: normalizeTimeValue(row.reminder_time, ['20:30', '21:00', '21:30'], '21:00'),
    morningReminderTime: normalizeTimeValue(
      row.morning_reminder_time,
      ['07:00', '08:00', '08:30'],
      '08:00',
    ),
    nightReminderTime: normalizeTimeValue(
      row.night_reminder_time,
      ['20:30', '21:00', '21:30'],
      '21:00',
    ),
    quietHoursStart: normalizeTimeValue(
      row.quiet_hours_start,
      ['21:30', '22:00', '22:30'],
      '22:30',
    ),
    quietHoursEnd: normalizeTimeValue(row.quiet_hours_end, ['07:00', '07:30', '08:00'], '08:00'),
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
        id, profile_id, brushing_frequency_per_day, flossing_enabled, floss_sessions_per_week, mouthwash_enabled, mouthwash_sessions_per_week,
        reminders_enabled, reminder_time, morning_reminder_time, night_reminder_time,
        quiet_hours_start, quiet_hours_end, toothbrush_replacement_interval_days,
        toothbrush_last_replaced_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id) DO UPDATE SET
        brushing_frequency_per_day = excluded.brushing_frequency_per_day,
        flossing_enabled = excluded.flossing_enabled,
        floss_sessions_per_week = excluded.floss_sessions_per_week,
        mouthwash_enabled = excluded.mouthwash_enabled,
        mouthwash_sessions_per_week = excluded.mouthwash_sessions_per_week,
        reminders_enabled = excluded.reminders_enabled,
        reminder_time = excluded.reminder_time,
        morning_reminder_time = excluded.morning_reminder_time,
        night_reminder_time = excluded.night_reminder_time,
        quiet_hours_start = excluded.quiet_hours_start,
        quiet_hours_end = excluded.quiet_hours_end,
        toothbrush_replacement_interval_days = excluded.toothbrush_replacement_interval_days,
        toothbrush_last_replaced_at = excluded.toothbrush_last_replaced_at,
        updated_at = excluded.updated_at;`,
      [
        settings.id,
        settings.profileId,
        normalizeBrushingFrequency(settings.brushingFrequencyPerDay),
        toSqliteBoolean(settings.flossingEnabled),
        normalizeWeeklySessions(settings.flossSessionsPerWeek),
        toSqliteBoolean(settings.mouthwashEnabled),
        normalizeWeeklySessions(settings.mouthwashSessionsPerWeek),
        toSqliteBoolean(settings.remindersEnabled),
        settings.reminderTime,
        settings.morningReminderTime,
        settings.nightReminderTime,
        settings.quietHoursStart,
        settings.quietHoursEnd,
        settings.toothbrushReplacementIntervalDays,
        settings.toothbrushLastReplacedAt,
        settings.createdAt,
        settings.updatedAt,
      ],
    );
  }
}

export const routineSettingsRepository = new RoutineSettingsRepository(databaseService);
