import type { BottleBreakdownModel } from './inventory.model';

export interface BarDispenseRuleModel {
  id: number;
  restaurantId: number;
  branchId: number;
  beverageName: string;
  brandGroup?: string;
  primaryInventoryItemId: number;
  fallbackInventoryItemId?: number;
  shotSingleMl: number;
  shotDoubleMl: number;
  notes?: string;
  isActive: boolean;
  primaryItemName?: string;
  primaryPackSize?: number;
  primaryUomSymbol?: string;
  primaryDispenseUomSymbol?: string;
  primaryBottleBreakdown?: BottleBreakdownModel | null;
  fallbackItemName?: string;
  fallbackPackSize?: number;
  fallbackUomSymbol?: string;
  fallbackBottleBreakdown?: BottleBreakdownModel | null;
  createdAt?: string;
}
