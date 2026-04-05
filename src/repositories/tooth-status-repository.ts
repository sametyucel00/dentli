import { ToothCurrentStatus, ToothStatusHistory } from '@/src/domain/models';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type ToothCurrentStatusRow = {
  id: string;
  profile_id: string;
  tooth_number: number;
  status: ToothCurrentStatus['status'];
  note: string | null;
  recorded_at: string;
  updated_at: string;
};

type ToothStatusHistoryRow = {
  id: string;
  profile_id: string;
  tooth_number: number;
  status: ToothStatusHistory['status'];
  note: string | null;
  recorded_at: string;
  source: string | null;
};

function mapCurrentStatus(row: ToothCurrentStatusRow): ToothCurrentStatus {
  return {
    id: row.id,
    profileId: row.profile_id,
    toothNumber: row.tooth_number,
    status: row.status,
    note: row.note,
    recordedAt: row.recorded_at,
    updatedAt: row.updated_at,
  };
}

function mapStatusHistory(row: ToothStatusHistoryRow): ToothStatusHistory {
  return {
    id: row.id,
    profileId: row.profile_id,
    toothNumber: row.tooth_number,
    status: row.status,
    note: row.note,
    recordedAt: row.recorded_at,
    source: row.source,
  };
}

export class ToothStatusRepository extends BaseRepository {
  async listCurrentByProfileId(profileId: string) {
    const rows = await this.database.getAll<ToothCurrentStatusRow>(
      `SELECT * FROM tooth_current_status WHERE profile_id = ? ORDER BY tooth_number ASC;`,
      [profileId],
    );

    return rows.map(mapCurrentStatus);
  }

  async listHistoryByProfileId(profileId: string) {
    const rows = await this.database.getAll<ToothStatusHistoryRow>(
      `SELECT * FROM tooth_status_history WHERE profile_id = ? ORDER BY recorded_at DESC;`,
      [profileId],
    );

    return rows.map(mapStatusHistory);
  }

  async getCurrentByToothNumber(profileId: string, toothNumber: number) {
    const row = await this.database.getFirst<ToothCurrentStatusRow>(
      `SELECT * FROM tooth_current_status
       WHERE profile_id = ? AND tooth_number = ?
       LIMIT 1;`,
      [profileId, toothNumber],
    );

    return row ? mapCurrentStatus(row) : null;
  }

  async listHistoryByToothNumber(profileId: string, toothNumber: number, limit = 12) {
    const rows = await this.database.getAll<ToothStatusHistoryRow>(
      `SELECT * FROM tooth_status_history
       WHERE profile_id = ? AND tooth_number = ?
       ORDER BY recorded_at DESC
       LIMIT ?;`,
      [profileId, toothNumber, limit],
    );

    return rows.map(mapStatusHistory);
  }

  async getHistoryById(id: string) {
    const row = await this.database.getFirst<ToothStatusHistoryRow>(
      `SELECT * FROM tooth_status_history WHERE id = ? LIMIT 1;`,
      [id],
    );

    return row ? mapStatusHistory(row) : null;
  }

  async upsertCurrentStatus(status: ToothCurrentStatus) {
    await this.database.run(
      `INSERT INTO tooth_current_status (
        id, profile_id, tooth_number, status, note, recorded_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id, tooth_number) DO UPDATE SET
        status = excluded.status,
        note = excluded.note,
        recorded_at = excluded.recorded_at,
        updated_at = excluded.updated_at;`,
      [
        status.id,
        status.profileId,
        status.toothNumber,
        status.status,
        status.note,
        status.recordedAt,
        status.updatedAt,
      ],
    );
  }

  async appendHistory(entry: ToothStatusHistory) {
    await this.database.run(
      `INSERT INTO tooth_status_history (id, profile_id, tooth_number, status, note, recorded_at, source)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        entry.id,
        entry.profileId,
        entry.toothNumber,
        entry.status,
        entry.note,
        entry.recordedAt,
        entry.source,
      ],
    );
  }

  async updateHistory(entry: ToothStatusHistory) {
    await this.database.run(
      `UPDATE tooth_status_history
       SET status = ?, note = ?, recorded_at = ?, source = ?
       WHERE id = ?;`,
      [entry.status, entry.note, entry.recordedAt, entry.source, entry.id],
    );
  }

  async deleteHistoryById(id: string) {
    await this.database.run(`DELETE FROM tooth_status_history WHERE id = ?;`, [id]);
  }

  async deleteCurrentByProfileAndTooth(profileId: string, toothNumber: number) {
    await this.database.run(
      `DELETE FROM tooth_current_status WHERE profile_id = ? AND tooth_number = ?;`,
      [profileId, toothNumber],
    );
  }
}

export const toothStatusRepository = new ToothStatusRepository(databaseService);
