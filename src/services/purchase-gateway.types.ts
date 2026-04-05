import { EntitlementRecord, MonetizationProductId } from '@/src/domain/models';
import { PurchaseProduct } from '@/src/features/monetization/model';

export type PurchaseGatewayResult = {
  entitlement: EntitlementRecord;
};

export interface PurchaseGateway {
  getProducts(): Promise<PurchaseProduct[]>;
  purchase(productId: MonetizationProductId): Promise<PurchaseGatewayResult>;
  restore(): Promise<PurchaseGatewayResult[]>;
}
