import { EntitlementRecord } from '@/src/domain/models';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type EntitlementRow = {
  product_id: EntitlementRecord['productId'];
  plan: EntitlementRecord['plan'];
  status: EntitlementRecord['status'];
  purchased_at: string | null;
  restored_at: string | null;
  source: string | null;
  updated_at: string;
};

function mapEntitlement(row: EntitlementRow): EntitlementRecord {
  return {
    productId: row.product_id,
    plan: row.plan,
    status: row.status,
    purchasedAt: row.purchased_at,
    restoredAt: row.restored_at,
    source: row.source,
    updatedAt: row.updated_at,
  };
}

export class AppEntitlementsRepository extends BaseRepository {
  async list() {
    const rows = await this.database.getAll<EntitlementRow>(
      `SELECT * FROM app_entitlements ORDER BY updated_at DESC;`,
    );

    return rows.map(mapEntitlement);
  }

  async getByProductId(productId: EntitlementRecord['productId']) {
    const row = await this.database.getFirst<EntitlementRow>(
      `SELECT * FROM app_entitlements WHERE product_id = ? LIMIT 1;`,
      [productId],
    );

    return row ? mapEntitlement(row) : null;
  }

  async upsert(record: EntitlementRecord) {
    await this.database.run(
      `INSERT INTO app_entitlements (
        product_id, plan, status, purchased_at, restored_at, source, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET
        plan = excluded.plan,
        status = excluded.status,
        purchased_at = excluded.purchased_at,
        restored_at = excluded.restored_at,
        source = excluded.source,
        updated_at = excluded.updated_at;`,
      [
        record.productId,
        record.plan,
        record.status,
        record.purchasedAt,
        record.restoredAt,
        record.source,
        record.updatedAt,
      ],
    );
  }
}

export const appEntitlementsRepository = new AppEntitlementsRepository(databaseService);
