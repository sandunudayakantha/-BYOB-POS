import { apiClient } from "@/app/core/http/api-client";
import {
  mapCreateRawItemInputToDto,
  mapInventoryItemDtoToModel,
  type InventoryItemDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { InventoryItemModel } from "@/app/models/inventory.model";

export interface CreateRawItemMutationInput {
  branchId: number;
  name: string;
  sku?: string;
  supplierId?: number;
  uomId: number;
  itemType: string;
  currentStock: number;
  reorderThreshold: number;
  unitCost: number;
  isActive: boolean;
}

export async function createRawItemMutation(input: CreateRawItemMutationInput): Promise<InventoryItemModel> {
  const payload = mapCreateRawItemInputToDto(input);
  const response = await apiClient.post<ApiResponseEnvelope<InventoryItemDto>>("/inventory/items", payload, {
    params: { branchId: input.branchId },
  });
  const raw = (response as any)?.data?.data || (response as any)?.data || response;
  return mapInventoryItemDtoToModel(raw);
}
