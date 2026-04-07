import {
  ErrorCode,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  restorePurchases as restoreStorePurchases,
  type Product,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';

import { EntitlementRecord, MonetizationProductId } from '@/src/domain/models';
import {
  DENTLI_PRO_PRODUCT_ID,
  MONETIZATION_PRODUCTS,
  type PurchaseProduct,
} from '@/src/features/monetization/model';
import { nowIso } from '@/src/lib/runtime';
import { appEntitlementsRepository } from '@/src/repositories';
import {
  PurchaseGateway,
  PurchaseGatewayResult,
} from '@/src/services/purchase-gateway.types';

const PRODUCT_IDS: MonetizationProductId[] = [DENTLI_PRO_PRODUCT_ID];
const PURCHASE_TIMEOUT_MS = 45_000;

function createActiveEntitlement(
  productId: MonetizationProductId,
  source: string,
  restoredAt: string | null,
  purchasedAt: string | null,
) {
  const timestamp = nowIso();

  return {
    productId,
    plan: 'pro',
    status: 'active',
    purchasedAt: purchasedAt ?? timestamp,
    restoredAt,
    source,
    updatedAt: timestamp,
  } satisfies EntitlementRecord;
}

function purchaseTimestampToIso(purchase: Purchase) {
  return Number.isFinite(purchase.transactionDate)
    ? new Date(purchase.transactionDate).toISOString()
    : nowIso();
}

function mapStoreProduct(product: Product): PurchaseProduct | null {
  const template = MONETIZATION_PRODUCTS.find(
    (entry) => entry.id === (product.id as MonetizationProductId),
  );

  if (!template) {
    return null;
  }

  return {
    ...template,
    storePriceLabel: product.displayPrice,
  };
}

function isOneTimeProduct(product: Product | { type?: string }): product is Product {
  return product.type === 'in-app';
}

function mapPurchaseError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as PurchaseError).code === ErrorCode.UserCancelled
  ) {
    return new Error('Purchase canceled.');
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Unable to complete App Store purchase.');
}

class IosPurchaseGateway implements PurchaseGateway {
  private connectionPromise: Promise<void> | null = null;

  private async ensureConnection() {
    if (!this.connectionPromise) {
      this.connectionPromise = initConnection().then(() => undefined).catch((error) => {
        this.connectionPromise = null;
        throw mapPurchaseError(error);
      });
    }

    return this.connectionPromise;
  }

  private async waitForPurchase(productId: MonetizationProductId) {
    await this.ensureConnection();

    return new Promise<Purchase>((resolve, reject) => {
      let settled = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        purchaseUpdatedSubscription.remove();
        purchaseErrorSubscription.remove();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };

      const settle = (callback: () => void) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        callback();
      };

      const purchaseUpdatedSubscription = purchaseUpdatedListener((purchase) => {
        if (purchase.productId !== productId) {
          return;
        }

        settle(() => resolve(purchase));
      });

      const purchaseErrorSubscription = purchaseErrorListener((error) => {
        if (error.productId && error.productId !== productId) {
          return;
        }

        settle(() => reject(mapPurchaseError(error)));
      });

      timeoutId = setTimeout(() => {
        settle(() => reject(new Error('App Store purchase timed out.')));
      }, PURCHASE_TIMEOUT_MS);

      void requestPurchase({
        request: {
          apple: {
            sku: productId,
            andDangerouslyFinishTransactionAutomatically: false,
          },
        },
        type: 'in-app',
      })
        .then((result) => {
          const normalized = Array.isArray(result) ? result[0] : result;

          if (normalized && normalized.productId === productId) {
            settle(() => resolve(normalized));
          }
        })
        .catch((error) => {
          settle(() => reject(mapPurchaseError(error)));
        });
    });
  }

  async getProducts() {
    await this.ensureConnection();

    const storeProducts = (await fetchProducts({
      skus: PRODUCT_IDS,
      type: 'in-app',
    }).catch(() => [])) ?? [];

    const mappedProducts = storeProducts
      .filter(isOneTimeProduct)
      .map(mapStoreProduct)
      .filter((product): product is PurchaseProduct => Boolean(product));

    return MONETIZATION_PRODUCTS.map(
      (product) => mappedProducts.find((entry) => entry.id === product.id) ?? product,
    );
  }

  async purchase(productId: MonetizationProductId): Promise<PurchaseGatewayResult> {
    const purchase = await this.waitForPurchase(productId);
    await finishTransaction({
      purchase,
      isConsumable: false,
    });

    const entitlement = createActiveEntitlement(
      productId,
      'app_store_ios',
      null,
      purchaseTimestampToIso(purchase),
    );

    await appEntitlementsRepository.upsert(entitlement);

    return { entitlement };
  }

  async restore(): Promise<PurchaseGatewayResult[]> {
    await this.ensureConnection();
    await restoreStorePurchases();

    const purchases = await getAvailablePurchases({
      onlyIncludeActiveItemsIOS: true,
    });
    const restoredAt = nowIso();
    const restoredPurchases = purchases.filter((purchase) =>
      PRODUCT_IDS.includes(purchase.productId as MonetizationProductId),
    );

    const results: PurchaseGatewayResult[] = [];

    for (const purchase of restoredPurchases) {
      const entitlement = createActiveEntitlement(
        purchase.productId as MonetizationProductId,
        'app_store_ios_restore',
        restoredAt,
        purchaseTimestampToIso(purchase),
      );
      await appEntitlementsRepository.upsert(entitlement);
      results.push({ entitlement });
    }

    return results;
  }
}

export const purchaseGateway = new IosPurchaseGateway();
