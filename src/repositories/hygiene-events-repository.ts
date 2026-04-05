import { HygieneEvent } from '@/src/domain/models';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type HygieneEventRow = {
  id: string;
  profile_id: string;
  event_type: HygieneEvent['eventType'];
  action_key: HygieneEvent['actionKey'];
  occurred_at: string;
  duration_seconds: number | null;
  notes: string | null;
};

function mapHygieneEvent(row: HygieneEventRow): HygieneEvent {
  return {
    id: row.id,
    profileId: row.profile_id,
    eventType: row.event_type,
    actionKey: row.action_key,
    occurredAt: row.occurred_at,
    durationSeconds: row.duration_seconds,
    notes: row.notes,
  };
}

export class HygieneEventsRepository extends BaseRepository {
  async listByProfileId(profileId: string, limit?: number) {
    const rows = await this.database.getAll<HygieneEventRow>(
      `SELECT * FROM hygiene_events WHERE profile_id = ? ORDER BY occurred_at DESC${
        limit ? ' LIMIT ?' : ''
      };`,
      limit ? [profileId, limit] : [profileId],
    );

    return rows.map(mapHygieneEvent);
  }

  async listByDateRange(profileId: string, startAt: string, endAt: string) {
    const rows = await this.database.getAll<HygieneEventRow>(
      `SELECT * FROM hygiene_events
       WHERE profile_id = ? AND occurred_at >= ? AND occurred_at < ?
       ORDER BY occurred_at DESC;`,
      [profileId, startAt, endAt],
    );

    return rows.map(mapHygieneEvent);
  }

  async getLatestByType(profileId: string, eventType: HygieneEvent['eventType']) {
    const row = await this.database.getFirst<HygieneEventRow>(
      `SELECT * FROM hygiene_events
       WHERE profile_id = ? AND event_type = ?
       ORDER BY occurred_at DESC
       LIMIT 1;`,
      [profileId, eventType],
    );

    return row ? mapHygieneEvent(row) : null;
  }

  async getById(id: string) {
    const row = await this.database.getFirst<HygieneEventRow>(
      `SELECT * FROM hygiene_events WHERE id = ? LIMIT 1;`,
      [id],
    );

    return row ? mapHygieneEvent(row) : null;
  }

  async getByActionKeyInRange(
    profileId: string,
    actionKey: NonNullable<HygieneEvent['actionKey']>,
    startAt: string,
    endAt: string,
  ) {
    const row = await this.database.getFirst<HygieneEventRow>(
      `SELECT * FROM hygiene_events
       WHERE profile_id = ? AND action_key = ? AND occurred_at >= ? AND occurred_at < ?
       ORDER BY occurred_at DESC
       LIMIT 1;`,
      [profileId, actionKey, startAt, endAt],
    );

    return row ? mapHygieneEvent(row) : null;
  }

  async listByActionKey(
    profileId: string,
    actionKey: NonNullable<HygieneEvent['actionKey']>,
    limit = 7,
  ) {
    const rows = await this.database.getAll<HygieneEventRow>(
      `SELECT * FROM hygiene_events
       WHERE profile_id = ? AND action_key = ?
       ORDER BY occurred_at DESC
       LIMIT ?;`,
      [profileId, actionKey, limit],
    );

    return rows.map(mapHygieneEvent);
  }

  async create(event: HygieneEvent) {
    await this.database.run(
      `INSERT INTO hygiene_events (
        id, profile_id, event_type, action_key, occurred_at, duration_seconds, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        event.id,
        event.profileId,
        event.eventType,
        event.actionKey,
        event.occurredAt,
        event.durationSeconds,
        event.notes,
      ],
    );
  }

  async update(event: HygieneEvent) {
    await this.database.run(
      `UPDATE hygiene_events
       SET event_type = ?, action_key = ?, occurred_at = ?, duration_seconds = ?, notes = ?
       WHERE id = ?;`,
      [
        event.eventType,
        event.actionKey,
        event.occurredAt,
        event.durationSeconds,
        event.notes,
        event.id,
      ],
    );
  }

  async deleteById(id: string) {
    await this.database.run(`DELETE FROM hygiene_events WHERE id = ?;`, [id]);
  }
}

export const hygieneEventsRepository = new HygieneEventsRepository(databaseService);
