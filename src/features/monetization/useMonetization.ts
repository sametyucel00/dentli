import { useEffect, useMemo, useState } from 'react';

import { PremiumFeatureKey } from '@/src/domain/models';
import { hasPremiumFeature } from '@/src/features/monetization/model';
import { entitlementService } from '@/src/services';
import { useAppStore } from '@/src/state/useAppStore';

export function useMonetization() {
  const entitlements = useAppStore((state) => state.entitlements);
  const profiles = useAppStore((state) => state.cache.profiles?.data ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [purchaseInFlight, setPurchaseInFlight] = useState(false);
  const [productList, setProductList] =
    useState<Awaited<ReturnType<typeof entitlementService.getProducts>>>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        setProductList(await entitlementService.getProducts());
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unable to load products.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function purchasePro() {
    if (purchaseInFlight) return;

    setPurchaseInFlight(true);
    setError(null);
    setNotice(null);
    try {
      await entitlementService.purchaseProLifetime();
      setNotice('purchase_success');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to complete purchase.');
    } finally {
      setPurchaseInFlight(false);
    }
  }

  async function restorePurchases() {
    if (purchaseInFlight) return;

    setPurchaseInFlight(true);
    setError(null);
    setNotice(null);
    try {
      const restoreResult = await entitlementService.restorePurchases();
      setNotice(restoreResult.restoredCount > 0 ? 'restore_success' : 'restore_empty');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to restore purchases.');
    } finally {
      setPurchaseInFlight(false);
    }
  }

  const hasFeature = (featureKey: PremiumFeatureKey) =>
    hasPremiumFeature(entitlements, featureKey);

  const multiProfileLockedCount = useMemo(
    () => Math.max(profiles.length - 1, 0),
    [profiles.length],
  );

  return {
    loading,
    error,
    notice,
    purchaseInFlight,
    productList,
    entitlements,
    isPro: entitlements.plan === 'pro',
    hasFeature,
    purchasePro,
    restorePurchases,
    multiProfileLockedCount,
  };
}

export function useFeatureAccess(featureKey: PremiumFeatureKey) {
  const entitlements = useAppStore((state) => state.entitlements);
  return hasPremiumFeature(entitlements, featureKey);
}
