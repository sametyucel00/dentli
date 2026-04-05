import { EntitlementRecord, MonetizationProductId } from '@/src/domain/models';
import {
  DENTLI_PRO_PRODUCT_ID,
  MONETIZATION_PRODUCTS,
} from '@/src/features/monetization/model';
import { nowIso } from '@/src/lib/runtime';
import { appEntitlementsRepository } from '@/src/repositories';
import {
  PurchaseGateway,
  PurchaseGatewayResult,
} from '@/src/services/purchase-gateway.types';

function createActiveEntitlement(
  productId: MonetizationProductId,
  source: string,
  restoredAt: string | null,
) {
  const timestamp = nowIso();

  return {
    productId,
    plan: 'pro',
    status: 'active',
    purchasedAt: timestamp,
    restoredAt,
    source,
    updatedAt: timestamp,
  } satisfies EntitlementRecord;
}

class LocalPurchaseGateway implements PurchaseGateway {
  async getProducts() {
    return MONETIZATION_PRODUCTS;
  }

  async purchase(productId: MonetizationProductId): Promise<PurchaseGatewayResult> {
    const entitlement = createActiveEntitlement(productId, 'local_purchase', null);
    await appEntitlementsRepository.upsert(entitlement);

    return { entitlement };
  }

  async restore(): Promise<PurchaseGatewayResult[]> {
    const existing = await appEntitlementsRepository.getByProductId(DENTLI_PRO_PRODUCT_ID);

    if (!existing || existing.status !== 'active') {
      return [];
    }

    const restoredEntitlement: EntitlementRecord = {
      ...existing,
      restoredAt: nowIso(),
      source: existing.source ?? 'local_restore',
      updatedAt: nowIso(),
    };

    await appEntitlementsRepository.upsert(restoredEntitlement);

    return [{ entitlement: restoredEntitlement }];
  }
}

export const localPurchaseGateway = new LocalPurchaseGateway();
