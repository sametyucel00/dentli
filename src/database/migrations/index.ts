import { DatabaseMigration } from '@/src/database/migrations/types';

export const migrations: DatabaseMigration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: [
      `CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        preferred_language TEXT NOT NULL DEFAULT 'en',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS routine_settings (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL UNIQUE,
        brushing_frequency_per_day INTEGER NOT NULL DEFAULT 2,
        flossing_enabled INTEGER NOT NULL DEFAULT 1,
        mouthwash_enabled INTEGER NOT NULL DEFAULT 0,
        reminders_enabled INTEGER NOT NULL DEFAULT 1,
        reminder_time TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS hygiene_events (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        duration_seconds INTEGER,
        notes TEXT,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS symptom_events (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        symptom_type TEXT NOT NULL,
        severity INTEGER NOT NULL,
        tooth_number INTEGER,
        notes TEXT,
        occurred_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        title TEXT NOT NULL,
        provider_name TEXT,
        starts_at TEXT NOT NULL,
        ends_at TEXT,
        location TEXT,
        notes TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS care_items (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        status TEXT NOT NULL,
        due_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS tooth_current_status (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        tooth_number INTEGER NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        recorded_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(profile_id, tooth_number),
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS tooth_status_history (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        tooth_number INTEGER NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        recorded_at TEXT NOT NULL,
        source TEXT,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_hygiene_events_profile_id_occurred_at ON hygiene_events(profile_id, occurred_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_symptom_events_profile_id_occurred_at ON symptom_events(profile_id, occurred_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_appointments_profile_id_starts_at ON appointments(profile_id, starts_at ASC);`,
      `CREATE INDEX IF NOT EXISTS idx_care_items_profile_id_status ON care_items(profile_id, status);`,
      `CREATE INDEX IF NOT EXISTS idx_tooth_current_status_profile_id ON tooth_current_status(profile_id);`,
      `CREATE INDEX IF NOT EXISTS idx_tooth_status_history_profile_tooth ON tooth_status_history(profile_id, tooth_number, recorded_at DESC);`,
    ],
  },
  {
    version: 2,
    name: 'today_tracking_support',
    up: [
      `ALTER TABLE routine_settings ADD COLUMN toothbrush_replacement_interval_days INTEGER NOT NULL DEFAULT 90;`,
      `ALTER TABLE routine_settings ADD COLUMN toothbrush_last_replaced_at TEXT;`,
      `ALTER TABLE hygiene_events ADD COLUMN action_key TEXT;`,
      `CREATE INDEX IF NOT EXISTS idx_hygiene_events_profile_action_key_occurred_at ON hygiene_events(profile_id, action_key, occurred_at DESC);`,
    ],
  },
  {
    version: 3,
    name: 'symptom_severity_optional',
    up: [
      `ALTER TABLE symptom_events RENAME TO symptom_events_old;`,
      `CREATE TABLE symptom_events (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        symptom_type TEXT NOT NULL,
        severity INTEGER,
        tooth_number INTEGER,
        notes TEXT,
        occurred_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );`,
      `INSERT INTO symptom_events (id, profile_id, symptom_type, severity, tooth_number, notes, occurred_at)
       SELECT id, profile_id, symptom_type, severity, tooth_number, notes, occurred_at
       FROM symptom_events_old;`,
      `DROP TABLE symptom_events_old;`,
      `CREATE INDEX IF NOT EXISTS idx_symptom_events_profile_id_occurred_at ON symptom_events(profile_id, occurred_at DESC);`,
    ],
  },
  {
    version: 4,
    name: 'appointment_reminders',
    up: [
      `ALTER TABLE appointments ADD COLUMN reminder_enabled INTEGER NOT NULL DEFAULT 0;`,
      `ALTER TABLE appointments ADD COLUMN reminder_minutes_before INTEGER;`,
      `ALTER TABLE appointments ADD COLUMN reminder_notification_id TEXT;`,
      `CREATE INDEX IF NOT EXISTS idx_appointments_profile_status_starts_at ON appointments(profile_id, status, starts_at ASC);`,
    ],
  },
  {
    version: 5,
    name: 'care_supply_tracking',
    up: [
      `ALTER TABLE care_items ADD COLUMN item_type TEXT NOT NULL DEFAULT 'other';`,
      `ALTER TABLE care_items ADD COLUMN tracking_enabled INTEGER NOT NULL DEFAULT 0;`,
      `ALTER TABLE care_items ADD COLUMN replacement_cycle_days INTEGER;`,
      `ALTER TABLE care_items ADD COLUMN last_replaced_at TEXT;`,
      `CREATE INDEX IF NOT EXISTS idx_care_items_profile_item_type ON care_items(profile_id, item_type);`,
    ],
  },
  {
    version: 6,
    name: 'app_entitlements',
    up: [
      `CREATE TABLE IF NOT EXISTS app_entitlements (
        product_id TEXT PRIMARY KEY NOT NULL,
        plan TEXT NOT NULL,
        status TEXT NOT NULL,
        purchased_at TEXT,
        restored_at TEXT,
        source TEXT,
        updated_at TEXT NOT NULL
      );`,
    ],
  },
  {
    version: 7,
    name: 'routine_settings_preferences',
    up: [
      `ALTER TABLE routine_settings ADD COLUMN morning_reminder_time TEXT;`,
      `ALTER TABLE routine_settings ADD COLUMN night_reminder_time TEXT;`,
      `ALTER TABLE routine_settings ADD COLUMN quiet_hours_start TEXT;`,
      `ALTER TABLE routine_settings ADD COLUMN quiet_hours_end TEXT;`,
    ],
  },
  {
    version: 8,
    name: 'app_preferences',
    up: [
      `CREATE TABLE IF NOT EXISTS app_preferences (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        biometric_lock_enabled INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );`,
      `INSERT OR IGNORE INTO app_preferences (id, biometric_lock_enabled, updated_at)
       VALUES (1, 0, datetime('now'));`,
    ],
  },
  {
    version: 9,
    name: 'appointments_clinical_fields',
    up: [
      `ALTER TABLE appointments ADD COLUMN appointment_type TEXT NOT NULL DEFAULT 'checkup';`,
      `ALTER TABLE appointments ADD COLUMN clinic_name TEXT;`,
      `ALTER TABLE appointments ADD COLUMN doctor_name TEXT;`,
      `UPDATE appointments
       SET clinic_name = location
       WHERE clinic_name IS NULL AND location IS NOT NULL;`,
      `UPDATE appointments
       SET doctor_name = provider_name
       WHERE doctor_name IS NULL AND provider_name IS NOT NULL;`,
    ],
  },
];
