import {
  AppPlan,
  EntitlementRecord,
  EntitlementSnapshot,
  MonetizationProductId,
  PremiumFeatureKey,
} from '@/src/domain/models';

export const DENTLI_PRO_PRODUCT_ID: MonetizationProductId = 'dentli_pro_lifetime';

export const PRO_FEATURE_KEYS: PremiumFeatureKey[] = [
  'tooth_map_full',
  'dentist_mode',
  'pdf_export',
  'analytics_advanced',
  'multi_profile',
  'timeline_full',
  'care_full_inventory',
  'biometric_lock',
] as const;

export type PurchaseProduct = {
  id: MonetizationProductId;
  type: 'one_time';
  plan: AppPlan;
  featureKeys: PremiumFeatureKey[];
  titleKey: string;
  descriptionKey: string;
  priceLabelKey: string;
};

export const MONETIZATION_PRODUCTS: PurchaseProduct[] = [
  {
    id: DENTLI_PRO_PRODUCT_ID,
    type: 'one_time',
    plan: 'pro',
    featureKeys: PRO_FEATURE_KEYS,
    titleKey: 'monetization.products.pro.title',
    descriptionKey: 'monetization.products.pro.description',
    priceLabelKey: 'monetization.products.pro.price',
  },
] as const;

export const EMPTY_ENTITLEMENT_SNAPSHOT: EntitlementSnapshot = {
  plan: 'free',
  activeProductIds: [],
  purchasedAt: null,
  restoredAt: null,
  source: null,
};

export function createEntitlementSnapshot(records: EntitlementRecord[]): EntitlementSnapshot {
  const activeRecords = records
    .filter((record) => record.status === 'active')
    .sort((left, right) => {
      const leftTimestamp = new Date(left.updatedAt).getTime();
      const rightTimestamp = new Date(right.updatedAt).getTime();
      return rightTimestamp - leftTimestamp;
    });
  const proRecord = activeRecords.find((record) => record.plan === 'pro') ?? null;
  const activeProductIds = [...new Set(activeRecords.map((record) => record.productId))];

  return {
    plan: proRecord ? 'pro' : 'free',
    activeProductIds,
    purchasedAt: proRecord?.purchasedAt ?? null,
    restoredAt: proRecord?.restoredAt ?? null,
    source: proRecord?.source ?? null,
  };
}

export function hasPremiumFeature(
  entitlements: EntitlementSnapshot,
  featureKey: PremiumFeatureKey,
) {
  if (entitlements.plan !== 'pro') {
    return false;
  }

  return PRO_FEATURE_KEYS.includes(featureKey);
}
