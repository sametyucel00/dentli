import { SymptomEvent } from '@/src/domain/models';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type SymptomEventRow = {
  id: string;
  profile_id: string;
  symptom_type: SymptomEvent['symptomType'];
  severity: number | null;
  tooth_number: number | null;
  notes: string | null;
  occurred_at: string;
};

function mapSymptomEvent(row: SymptomEventRow): SymptomEvent {
  return {
    id: row.id,
    profileId: row.profile_id,
    symptomType: row.symptom_type,
    severity: row.severity,
    toothNumber: row.tooth_number,
    notes: row.notes,
    occurredAt: row.occurred_at,
  };
}

export class SymptomEventsRepository extends BaseRepository {
  async listByProfileId(profileId: string, limit?: number) {
    const rows = await this.database.getAll<SymptomEventRow>(
      `SELECT * FROM symptom_events WHERE profile_id = ? ORDER BY occurred_at DESC${
        limit ? ' LIMIT ?' : ''
      };`,
      limit ? [profileId, limit] : [profileId],
    );

    return rows.map(mapSymptomEvent);
  }

  async create(event: SymptomEvent) {
    await this.database.run(
      `INSERT INTO symptom_events (id, profile_id, symptom_type, severity, tooth_number, notes, occurred_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        event.id,
        event.profileId,
        event.symptomType,
        event.severity,
        event.toothNumber,
        event.notes,
        event.occurredAt,
      ],
    );
  }

  async getById(id: string) {
    const row = await this.database.getFirst<SymptomEventRow>(
      `SELECT * FROM symptom_events WHERE id = ? LIMIT 1;`,
      [id],
    );

    return row ? mapSymptomEvent(row) : null;
  }

  async update(event: SymptomEvent) {
    await this.database.run(
      `UPDATE symptom_events
       SET symptom_type = ?, severity = ?, tooth_number = ?, notes = ?, occurred_at = ?
       WHERE id = ?;`,
      [
        event.symptomType,
        event.severity,
        event.toothNumber,
        event.notes,
        event.occurredAt,
        event.id,
      ],
    );
  }

  async deleteById(id: string) {
    await this.database.run(`DELETE FROM symptom_events WHERE id = ?;`, [id]);
  }
}

export const symptomEventsRepository = new SymptomEventsRepository(databaseService);
