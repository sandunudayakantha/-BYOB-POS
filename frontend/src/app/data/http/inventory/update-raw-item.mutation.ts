import { apiClient } from "@/app/core/http/api-client";
import {
  mapUpdateRawItemInputToDto,
  mapInventoryItemDtoToModel,
  type InventoryItemDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { InventoryItemModel } from "@/app/models/inventory.model";

export interface UpdateRawItemMutationInput {
  itemId: number;
  name?: string;
  sku?: string;
  supplierId?: number;
  uomId?: number;
  reorderThreshold?: number;
  isActive?: boolean;
}

export async function updateRawItemMutation(input: UpdateRawItemMutationInput): Promise<InventoryItemModel> {
  const payload = mapUpdateRawItemInputToDto(input);
  const response = await apiClient.put<ApiResponseEnvelope<InventoryItemDto>>(`/inventory/items/${input.itemId}`, payload);
  const raw = (response as any)?.data?.data || (response as any)?.data || response;
  return mapInventoryItemDtoToModel(raw);
}
