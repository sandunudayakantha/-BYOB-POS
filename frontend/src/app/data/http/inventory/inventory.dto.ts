import type {
  UnitOfMeasureModel,
  SupplierModel,
  InventoryItemModel,
  RawInventoryBatchModel,
  KitchenPrepDefinitionModel,
  KitchenPrepBatchModel,
} from '@/app/models/inventory.model';

// DTO Interfaces
export interface UnitOfMeasureDto {
  id: number;
  name: string;
  symbol: string;
  uom_type: string;
}

export interface SupplierDto {
  id: number;
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active: boolean;
}

export interface InventoryItemDto {
  id: number;
  restaurant_id: number;
  branch_id: number;
  uom_id: number;
  supplier_id?: number | null;
  name: string;
  sku?: string | null;
  item_type: string;
  current_stock: number;
  reorder_threshold: number;
  unit_cost: number;
  is_active: boolean;
  uom_name?: string | null;
  uom_symbol?: string | null;
  supplier_name?: string | null;
  created_at: string;
}

export interface RawInventoryBatchDto {
  id: number;
  inventory_item_id: number;
  branch_id: number;
  supplier_id?: number | null;
  supplier_name?: string | null;
  batch_number: string;
  quantity_received: number;
  quantity_remaining: number;
  unit_cost: number;
  received_date: string;
  expiry_date?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
}

export interface KitchenPrepDefinitionDto {
  id: number;
  restaurant_id: number;
  branch_id: number;
  base_raw_item_id: number;
  base_raw_item_name?: string | null;
  base_raw_item_uom_symbol?: string | null;
  uom_id?: number | null;
  uom_name?: string | null;
  uom_symbol?: string | null;
  portion_size_value?: number | null;
  portion_size_uom_id?: number | null;
  portion_size_uom_symbol?: string | null;
  name: string;
  description?: string | null;
  expected_yield_percent: number;
  current_stock: number;
  requires_image_evidence: boolean;
  track_wastage: boolean;
  requires_wastage_image: boolean;
  is_active: boolean;
  created_at: string;
}

export interface KitchenPrepBatchDto {
  id: number;
  prep_definition_id: number;
  prep_definition_name?: string | null;
  base_raw_item_id?: number | null;
  branch_id: number;
  prepared_by_user_id: number;
  prepared_by_name?: string | null;
  raw_input_quantity: number;
  actual_yield_quantity: number;
  output_uom_symbol?: string | null;
  wastage_quantity: number;
  wastage_reason?: string | null;
  prep_image_url?: string | null;
  wastage_image_url?: string | null;
  calculated_unit_cost: number;
  status: string;
  created_at: string;
}

// Request Payload DTOs
export interface CreateRawItemRequestDto {
  name: string;
  sku?: string;
  supplier_id?: number;
  uom_id: number;
  item_type: string;
  current_stock: number;
  reorder_threshold: number;
  unit_cost: number;
  is_active: boolean;
}

export interface UpdateRawItemRequestDto {
  name?: string;
  sku?: string;
  supplier_id?: number;
  uom_id?: number;
  reorder_threshold?: number;
  is_active?: boolean;
}

export interface InwardStockBatchRequestDto {
  quantity_received: number;
  unit_cost: number;
  received_date?: string;
  expiry_date?: string;
  supplier_id?: number;
  batch_number?: string;
  notes?: string;
}

export interface CreatePrepDefinitionRequestDto {
  base_raw_item_id: number;
  name: string;
  description?: string;
  uom_id?: number;
  portion_size_value?: number;
  portion_size_uom_id?: number;
  expected_yield_percent: number;
  requires_image_evidence: boolean;
  track_wastage: boolean;
  requires_wastage_image: boolean;
}

export interface UpdatePrepDefinitionRequestDto {
  name?: string;
  description?: string;
  uom_id?: number;
  portion_size_value?: number;
  portion_size_uom_id?: number;
  expected_yield_percent?: number;
  requires_image_evidence?: boolean;
  track_wastage?: boolean;
  requires_wastage_image?: boolean;
}

export interface LogPrepBatchRequestDto {
  prep_definition_id: number;
  raw_input_quantity: number;
  actual_yield_quantity: number;
  wastage_quantity?: number;
  wastage_reason?: string;
  prep_image_url?: string;
  wastage_image_url?: string;
}

// Mappers
export function mapUomDtoToModel(dto: UnitOfMeasureDto): UnitOfMeasureModel {
  return {
    id: dto.id,
    name: dto.name,
    symbol: dto.symbol,
    uomType: dto.uom_type,
  };
}

export function mapSupplierDtoToModel(dto: SupplierDto): SupplierModel {
  return {
    id: dto.id,
    name: dto.name,
    contactPerson: dto.contact_person ?? undefined,
    phone: dto.phone ?? undefined,
    email: dto.email ?? undefined,
    address: dto.address ?? undefined,
    isActive: dto.is_active,
  };
}

export function mapInventoryItemDtoToModel(dto: InventoryItemDto): InventoryItemModel {
  return {
    id: dto.id,
    restaurantId: dto.restaurant_id,
    branchId: dto.branch_id,
    uomId: dto.uom_id,
    supplierId: dto.supplier_id ?? undefined,
    name: dto.name,
    sku: dto.sku ?? undefined,
    itemType: dto.item_type as InventoryItemModel['itemType'],
    currentStock: Number(dto.current_stock),
    reorderThreshold: Number(dto.reorder_threshold),
    unitCost: Number(dto.unit_cost),
    isActive: dto.is_active,
    uomName: dto.uom_name ?? undefined,
    uomSymbol: dto.uom_symbol ?? undefined,
    supplierName: dto.supplier_name ?? undefined,
    createdAt: dto.created_at,
  };
}

export function mapRawInventoryBatchDtoToModel(dto: RawInventoryBatchDto): RawInventoryBatchModel {
  return {
    id: dto.id,
    inventoryItemId: dto.inventory_item_id,
    branchId: dto.branch_id,
    supplierId: dto.supplier_id ?? undefined,
    supplierName: dto.supplier_name ?? undefined,
    batchNumber: dto.batch_number,
    quantityReceived: Number(dto.quantity_received),
    quantityRemaining: Number(dto.quantity_remaining),
    unitCost: Number(dto.unit_cost),
    receivedDate: dto.received_date,
    expiryDate: dto.expiry_date ?? undefined,
    status: dto.status as RawInventoryBatchModel['status'],
    notes: dto.notes ?? undefined,
    createdAt: dto.created_at,
  };
}

export function mapKitchenPrepDefinitionDtoToModel(dto: KitchenPrepDefinitionDto): KitchenPrepDefinitionModel {
  return {
    id: dto.id,
    restaurantId: dto.restaurant_id,
    branchId: dto.branch_id,
    baseRawItemId: dto.base_raw_item_id,
    baseRawItemName: dto.base_raw_item_name ?? undefined,
    baseRawItemUomSymbol: dto.base_raw_item_uom_symbol ?? undefined,
    uomId: dto.uom_id ?? undefined,
    uomName: dto.uom_name ?? undefined,
    uomSymbol: dto.uom_symbol ?? undefined,
    portionSizeValue: dto.portion_size_value ? Number(dto.portion_size_value) : undefined,
    portionSizeUomId: dto.portion_size_uom_id ?? undefined,
    portionSizeUomSymbol: dto.portion_size_uom_symbol ?? undefined,
    name: dto.name,
    description: dto.description ?? undefined,
    expectedYieldPercent: Number(dto.expected_yield_percent),
    currentStock: Number(dto.current_stock),
    requiresImageEvidence: dto.requires_image_evidence,
    trackWastage: dto.track_wastage,
    requiresWastageImage: dto.requires_wastage_image,
    isActive: dto.is_active,
    createdAt: dto.created_at,
  };
}

export function mapKitchenPrepBatchDtoToModel(dto: KitchenPrepBatchDto): KitchenPrepBatchModel {
  return {
    id: dto.id,
    prepDefinitionId: dto.prep_definition_id,
    prepDefinitionName: dto.prep_definition_name ?? undefined,
    baseRawItemId: dto.base_raw_item_id ?? undefined,
    branchId: dto.branch_id,
    preparedByUserId: dto.prepared_by_user_id,
    preparedByName: dto.prepared_by_name ?? undefined,
    rawInputQuantity: Number(dto.raw_input_quantity),
    actualYieldQuantity: Number(dto.actual_yield_quantity),
    outputUomSymbol: dto.output_uom_symbol ?? undefined,
    wastageQuantity: Number(dto.wastage_quantity),
    wastageReason: dto.wastage_reason ?? undefined,
    prepImageUrl: dto.prep_image_url ?? undefined,
    wastageImageUrl: dto.wastage_image_url ?? undefined,
    calculatedUnitCost: Number(dto.calculated_unit_cost),
    status: dto.status,
    createdAt: dto.created_at,
  };
}

export function mapCreateRawItemInputToDto(input: {
  name: string;
  sku?: string;
  supplierId?: number;
  uomId: number;
  itemType: string;
  currentStock: number;
  reorderThreshold: number;
  unitCost: number;
  isActive: boolean;
}): CreateRawItemRequestDto {
  return {
    name: input.name.trim(),
    sku: input.sku?.trim() || undefined,
    supplier_id: input.supplierId,
    uom_id: input.uomId,
    item_type: input.itemType,
    current_stock: input.currentStock,
    reorder_threshold: input.reorderThreshold,
    unit_cost: input.unitCost,
    is_active: input.isActive,
  };
}

export function mapUpdateRawItemInputToDto(input: {
  name?: string;
  sku?: string;
  supplierId?: number;
  uomId?: number;
  reorderThreshold?: number;
  isActive?: boolean;
}): UpdateRawItemRequestDto {
  return {
    name: input.name?.trim(),
    sku: input.sku?.trim(),
    supplier_id: input.supplierId,
    uom_id: input.uomId,
    reorder_threshold: input.reorderThreshold,
    is_active: input.isActive,
  };
}

export function mapInwardStockBatchInputToDto(input: {
  quantityReceived: number;
  unitCost: number;
  receivedDate?: string;
  expiryDate?: string;
  supplierId?: number;
  batchNumber?: string;
  notes?: string;
}): InwardStockBatchRequestDto {
  return {
    quantity_received: input.quantityReceived,
    unit_cost: input.unitCost,
    received_date: input.receivedDate,
    expiry_date: input.expiryDate || undefined,
    supplier_id: input.supplierId || undefined,
    batch_number: input.batchNumber?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  };
}

export function mapCreatePrepDefinitionInputToDto(input: {
  baseRawItemId: number;
  name: string;
  description?: string;
  uomId?: number;
  portionSizeValue?: number;
  portionSizeUomId?: number;
  expectedYieldPercent: number;
  requiresImageEvidence: boolean;
  trackWastage: boolean;
  requiresWastageImage: boolean;
}): CreatePrepDefinitionRequestDto {
  return {
    base_raw_item_id: input.baseRawItemId,
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    uom_id: input.uomId || undefined,
    portion_size_value: input.portionSizeValue || undefined,
    portion_size_uom_id: input.portionSizeUomId || undefined,
    expected_yield_percent: input.expectedYieldPercent,
    requires_image_evidence: input.requiresImageEvidence,
    track_wastage: input.trackWastage,
    requires_wastage_image: input.requiresWastageImage,
  };
}

export function mapUpdatePrepDefinitionInputToDto(input: {
  name?: string;
  description?: string;
  uomId?: number;
  portionSizeValue?: number;
  portionSizeUomId?: number;
  expectedYieldPercent?: number;
  requiresImageEvidence?: boolean;
  track_wastage?: boolean;
  requiresWastageImage?: boolean;
}): UpdatePrepDefinitionRequestDto {
  return {
    name: input.name?.trim(),
    description: input.description?.trim(),
    uom_id: input.uomId,
    portion_size_value: input.portionSizeValue,
    portion_size_uom_id: input.portionSizeUomId,
    expected_yield_percent: input.expectedYieldPercent,
    requires_image_evidence: input.requiresImageEvidence,
    track_wastage: input.track_wastage,
    requires_wastage_image: input.requiresWastageImage,
  };
}

export function mapLogPrepBatchInputToDto(input: {
  prepDefinitionId: number;
  rawInputQuantity: number;
  actualYieldQuantity: number;
  wastageQuantity?: number;
  wastageReason?: string;
  prepImageUrl?: string;
  wastageImageUrl?: string;
}): LogPrepBatchRequestDto {
  return {
    prep_definition_id: input.prepDefinitionId,
    raw_input_quantity: input.rawInputQuantity,
    actual_yield_quantity: input.actualYieldQuantity,
    wastage_quantity: input.wastageQuantity ?? 0,
    wastage_reason: input.wastageReason?.trim() || undefined,
    prep_image_url: input.prepImageUrl?.trim() || undefined,
    wastage_image_url: input.wastageImageUrl?.trim() || undefined,
  };
}
