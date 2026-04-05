import { EntitlementSnapshot, PremiumFeatureKey } from '@/src/domain/models';
import {
  createEntitlementSnapshot,
  DENTLI_PRO_PRODUCT_ID,
  hasPremiumFeature,
} from '@/src/features/monetization/model';
import { appEntitlementsRepository } from '@/src/repositories';
import { purchaseGateway } from '@/src/services/purchase-gateway';
import { useAppStore } from '@/src/state/useAppStore';

class EntitlementService {
  private productsPromise:
    | Promise<Awaited<ReturnType<typeof purchaseGateway.getProducts>>>
    | null = null;

  async loadSnapshot() {
    const records = await appEntitlementsRepository.list();
    return createEntitlementSnapshot(records);
  }

  async syncSnapshot() {
    const snapshot = await this.loadSnapshot();
    useAppStore.getState().setEntitlements(snapshot);
    return snapshot;
  }

  async getProducts() {
    if (!this.productsPromise) {
      this.productsPromise = purchaseGateway.getProducts().catch((error) => {
        this.productsPromise = null;
        throw error;
      });
    }

    return this.productsPromise;
  }

  async purchaseProLifetime() {
    await purchaseGateway.purchase(DENTLI_PRO_PRODUCT_ID);
    return this.syncSnapshot();
  }

  async restorePurchases() {
    const restoredRecords = await purchaseGateway.restore();
    const snapshot = await this.syncSnapshot();

    return {
      snapshot,
      restoredCount: restoredRecords.length,
    };
  }

  getSnapshot(): EntitlementSnapshot {
    return useAppStore.getState().entitlements;
  }

  hasFeature(featureKey: PremiumFeatureKey) {
    return hasPremiumFeature(this.getSnapshot(), featureKey);
  }

  canAccessProfile(profileId: string | null, profileIds: string[]) {
    if (!profileId) {
      return true;
    }

    if (this.hasFeature('multi_profile')) {
      return true;
    }

    return profileId === (profileIds[0] ?? null);
  }

  getFallbackProfileId(profileIds: string[]) {
    return profileIds[0] ?? null;
  }
}

export const entitlementService = new EntitlementService();
