import { Appointment } from '@/src/domain/models';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type AppointmentRow = {
  id: string;
  profile_id: string;
  title: string;
  provider_name: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  notes: string | null;
  status: Appointment['status'];
  reminder_enabled: number;
  reminder_minutes_before: number | null;
  reminder_notification_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    providerName: row.provider_name,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    notes: row.notes,
    status: row.status,
    reminderEnabled: Boolean(row.reminder_enabled),
    reminderMinutesBefore: row.reminder_minutes_before,
    reminderNotificationId: row.reminder_notification_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class AppointmentsRepository extends BaseRepository {
  async listByProfileId(profileId: string) {
    const rows = await this.database.getAll<AppointmentRow>(
      `SELECT * FROM appointments WHERE profile_id = ? ORDER BY starts_at ASC;`,
      [profileId],
    );

    return rows.map(mapAppointment);
  }

  async getNextScheduledByProfileId(profileId: string, afterIso: string) {
    const row = await this.database.getFirst<AppointmentRow>(
      `SELECT * FROM appointments
       WHERE profile_id = ? AND status = 'scheduled' AND starts_at >= ?
       ORDER BY starts_at ASC
       LIMIT 1;`,
      [profileId, afterIso],
    );

    return row ? mapAppointment(row) : null;
  }

  async getById(id: string) {
    const row = await this.database.getFirst<AppointmentRow>(
      `SELECT * FROM appointments WHERE id = ? LIMIT 1;`,
      [id],
    );

    return row ? mapAppointment(row) : null;
  }

  async create(appointment: Appointment) {
    await this.database.run(
      `INSERT INTO appointments (
        id, profile_id, title, provider_name, starts_at, ends_at, location, notes, status,
        reminder_enabled, reminder_minutes_before, reminder_notification_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        appointment.id,
        appointment.profileId,
        appointment.title,
        appointment.providerName,
        appointment.startsAt,
        appointment.endsAt,
        appointment.location,
        appointment.notes,
        appointment.status,
        appointment.reminderEnabled ? 1 : 0,
        appointment.reminderMinutesBefore,
        appointment.reminderNotificationId,
        appointment.createdAt,
        appointment.updatedAt,
      ],
    );
  }

  async update(appointment: Appointment) {
    await this.database.run(
      `UPDATE appointments
       SET title = ?, provider_name = ?, starts_at = ?, ends_at = ?, location = ?, notes = ?, status = ?, reminder_enabled = ?, reminder_minutes_before = ?, reminder_notification_id = ?, updated_at = ?
       WHERE id = ?;`,
      [
        appointment.title,
        appointment.providerName,
        appointment.startsAt,
        appointment.endsAt,
        appointment.location,
        appointment.notes,
        appointment.status,
        appointment.reminderEnabled ? 1 : 0,
        appointment.reminderMinutesBefore,
        appointment.reminderNotificationId,
        appointment.updatedAt,
        appointment.id,
      ],
    );
  }

  async deleteById(id: string) {
    await this.database.run(`DELETE FROM appointments WHERE id = ?;`, [id]);
  }
}

export const appointmentsRepository = new AppointmentsRepository(databaseService);
