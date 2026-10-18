export type ItemType = 'RAW_MATERIAL' | 'SEMI_PROCESSED' | 'PACKAGING' | 'FINISHED_GOOD';
export type BatchStatus = 'ACTIVE' | 'DEPLETED' | 'EXPIRED';

export interface UnitOfMeasureModel {
  id: number;
  name: string;
  symbol: string;
  uomType: string;
}

export interface SupplierModel {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

export interface InventoryItemModel {
  id: number;
  restaurantId: number;
  branchId: number;
  uomId: number;
  supplierId?: number;
  name: string;
  sku?: string;
  itemType: ItemType;
  currentStock: number;
  reorderThreshold: number;
  unitCost: number;
  isActive: boolean;
  uomName?: string;
  uomSymbol?: string;
  supplierName?: string;
  createdAt: string;
}

export interface RawInventoryBatchModel {
  id: number;
  inventoryItemId: number;
  branchId: number;
  supplierId?: number;
  supplierName?: string;
  batchNumber: string;
  quantityReceived: number;
  quantityRemaining: number;
  unitCost: number;
  receivedDate: string;
  expiryDate?: string;
  status: BatchStatus;
  notes?: string;
  createdAt: string;
}

export interface KitchenPrepDefinitionModel {
  id: number;
  restaurantId: number;
  branchId: number;
  baseRawItemId: number;
  baseRawItemName?: string;
  baseRawItemUomSymbol?: string;
  uomId?: number;
  uomName?: string;
  uomSymbol?: string;
  portionSizeValue?: number;
  portionSizeUomId?: number;
  portionSizeUomSymbol?: string;
  name: string;
  description?: string;
  expectedYieldPercent: number;
  currentStock: number;
  requiresImageEvidence: boolean;
  trackWastage: boolean;
  requiresWastageImage: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface KitchenPrepBatchModel {
  id: number;
  prepDefinitionId: number;
  prepDefinitionName?: string;
  baseRawItemId?: number;
  branchId: number;
  preparedByUserId: number;
  preparedByName?: string;
  rawInputQuantity: number;
  actualYieldQuantity: number;
  outputUomSymbol?: string;
  wastageQuantity: number;
  wastageReason?: string;
  prepImageUrl?: string;
  wastageImageUrl?: string;
  calculatedUnitCost: number;
  status: string;
  createdAt: string;
}
