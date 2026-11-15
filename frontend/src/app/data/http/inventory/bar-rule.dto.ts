import { apiClient } from "@/app/core/http/api-client";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { BottleBreakdownDto } from "./inventory.dto";
import type { BarDispenseRuleModel } from "@/app/models/bar-rule.model";

export interface BarDispenseRuleDto {
  id: number;
  restaurant_id: number;
  branch_id: number;
  beverage_name: string;
  brand_group?: string | null;
  primary_inventory_item_id: number;
  fallback_inventory_item_id?: number | null;
  shot_single_ml: number;
  shot_double_ml: number;
  notes?: string | null;
  is_active: boolean;
  primary_item_name?: string | null;
  primary_pack_size?: number | null;
  primary_uom_symbol?: string | null;
  primary_dispense_uom_symbol?: string | null;
  primary_bottle_breakdown?: BottleBreakdownDto | null;
  fallback_item_name?: string | null;
  fallback_pack_size?: number | null;
  fallback_uom_symbol?: string | null;
  fallback_bottle_breakdown?: BottleBreakdownDto | null;
  created_at?: string;
}

export interface CreateBarDispenseRuleRequestDto {
  beverage_name: string;
  brand_group?: string;
  primary_inventory_item_id: number;
  fallback_inventory_item_id?: number;
  shot_single_ml: number;
  shot_double_ml: number;
  notes?: string;
  is_active: boolean;
}

export interface UpdateBarDispenseRuleRequestDto {
  beverage_name?: string;
  brand_group?: string;
  primary_inventory_item_id?: number;
  fallback_inventory_item_id?: number;
  shot_single_ml?: number;
  shot_double_ml?: number;
  notes?: string;
  is_active?: boolean;
}

export function mapBarDispenseRuleDtoToModel(dto: BarDispenseRuleDto): BarDispenseRuleModel {
  return {
    id: dto.id,
    restaurantId: dto.restaurant_id,
    branchId: dto.branch_id,
    beverageName: dto.beverage_name,
    brandGroup: dto.brand_group || undefined,
    primaryInventoryItemId: dto.primary_inventory_item_id,
    fallbackInventoryItemId: dto.fallback_inventory_item_id ?? undefined,
    shotSingleMl: Number(dto.shot_single_ml || 25),
    shotDoubleMl: Number(dto.shot_double_ml || 50),
    notes: dto.notes || undefined,
    isActive: dto.is_active ?? true,
    primaryItemName: dto.primary_item_name ?? undefined,
    primaryPackSize: dto.primary_pack_size ? Number(dto.primary_pack_size) : undefined,
    primaryUomSymbol: dto.primary_uom_symbol ?? undefined,
    primaryDispenseUomSymbol: dto.primary_dispense_uom_symbol ?? undefined,
    primaryBottleBreakdown: dto.primary_bottle_breakdown
      ? {
          sealedUnits: Number(dto.primary_bottle_breakdown.sealed_units || 0),
          hasOpenUnit: Boolean(dto.primary_bottle_breakdown.has_open_unit),
          openUnitRemaining: Number(dto.primary_bottle_breakdown.open_unit_remaining || 0),
          openUnitPercent: Number(dto.primary_bottle_breakdown.open_unit_percent || 0),
        }
      : null,
    fallbackItemName: dto.fallback_item_name ?? undefined,
    fallbackPackSize: dto.fallback_pack_size ? Number(dto.fallback_pack_size) : undefined,
    fallbackUomSymbol: dto.fallback_uom_symbol ?? undefined,
    fallbackBottleBreakdown: dto.fallback_bottle_breakdown
      ? {
          sealedUnits: Number(dto.fallback_bottle_breakdown.sealed_units || 0),
          hasOpenUnit: Boolean(dto.fallback_bottle_breakdown.has_open_unit),
          openUnitRemaining: Number(dto.fallback_bottle_breakdown.open_unit_remaining || 0),
          openUnitPercent: Number(dto.fallback_bottle_breakdown.open_unit_percent || 0),
        }
      : null,
    createdAt: dto.created_at,
  };
}

// HTTP API calls
export async function getBarDispenseRulesApi(branchId: number | string): Promise<BarDispenseRuleModel[]> {
  const response = await apiClient.get<ApiResponseEnvelope<BarDispenseRuleDto[]>>("/inventory/bar-rules", {
    params: { branchId },
  });
  const list = (response as any)?.data?.data || (response as any)?.data || response || [];
  return Array.isArray(list) ? list.map(mapBarDispenseRuleDtoToModel) : [];
}

export async function createBarDispenseRuleApi(
  branchId: number | string,
  payload: CreateBarDispenseRuleRequestDto
): Promise<BarDispenseRuleModel> {
  const response = await apiClient.post<ApiResponseEnvelope<BarDispenseRuleDto>>("/inventory/bar-rules", payload, {
    params: { branchId },
  });
  const data = (response as any)?.data?.data || (response as any)?.data || response;
  return mapBarDispenseRuleDtoToModel(data);
}

export async function updateBarDispenseRuleApi(
  ruleId: number,
  payload: UpdateBarDispenseRuleRequestDto
): Promise<BarDispenseRuleModel> {
  const response = await apiClient.put<ApiResponseEnvelope<BarDispenseRuleDto>>(`/inventory/bar-rules/${ruleId}`, payload);
  const data = (response as any)?.data?.data || (response as any)?.data || response;
  return mapBarDispenseRuleDtoToModel(data);
}

export async function deleteBarDispenseRuleApi(ruleId: number): Promise<void> {
  await apiClient.delete(`/inventory/bar-rules/${ruleId}`);
}
