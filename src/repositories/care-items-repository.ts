import { CareItem } from '@/src/domain/models';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type CareItemRow = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  category: CareItem['category'];
  item_type: CareItem['itemType'];
  status: CareItem['status'];
  tracking_enabled: number;
  replacement_cycle_days: number | null;
  last_replaced_at: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapCareItem(row: CareItemRow): CareItem {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    description: row.description,
    category: row.category,
    itemType: row.item_type,
    status: row.status,
    trackingEnabled: Boolean(row.tracking_enabled),
    replacementCycleDays: row.replacement_cycle_days,
    lastReplacedAt: row.last_replaced_at,
    dueAt: row.due_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class CareItemsRepository extends BaseRepository {
  async listByProfileId(profileId: string) {
    const rows = await this.database.getAll<CareItemRow>(
      `SELECT * FROM care_items WHERE profile_id = ? ORDER BY created_at DESC;`,
      [profileId],
    );

    return rows.map(mapCareItem);
  }

  async create(item: CareItem) {
    await this.database.run(
      `INSERT INTO care_items (
        id, profile_id, title, description, category, item_type, status,
        tracking_enabled, replacement_cycle_days, last_replaced_at, due_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        item.id,
        item.profileId,
        item.title,
        item.description,
        item.category,
        item.itemType,
        item.status,
        item.trackingEnabled ? 1 : 0,
        item.replacementCycleDays,
        item.lastReplacedAt,
        item.dueAt,
        item.createdAt,
        item.updatedAt,
      ],
    );
  }

  async getById(id: string) {
    const row = await this.database.getFirst<CareItemRow>(
      `SELECT * FROM care_items WHERE id = ? LIMIT 1;`,
      [id],
    );

    return row ? mapCareItem(row) : null;
  }

  async update(item: CareItem) {
    await this.database.run(
      `UPDATE care_items
       SET title = ?, description = ?, category = ?, item_type = ?, status = ?, tracking_enabled = ?,
           replacement_cycle_days = ?, last_replaced_at = ?, due_at = ?, updated_at = ?
       WHERE id = ?;`,
      [
        item.title,
        item.description,
        item.category,
        item.itemType,
        item.status,
        item.trackingEnabled ? 1 : 0,
        item.replacementCycleDays,
        item.lastReplacedAt,
        item.dueAt,
        item.updatedAt,
        item.id,
      ],
    );
  }

  async deleteById(id: string) {
    await this.database.run(`DELETE FROM care_items WHERE id = ?;`, [id]);
  }
}

export const careItemsRepository = new CareItemsRepository(databaseService);
