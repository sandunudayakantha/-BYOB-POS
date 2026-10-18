import { apiClient } from "@/app/core/http/api-client";
import {
  mapInventoryItemDtoToModel,
  type InventoryItemDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { InventoryItemModel } from "@/app/models/inventory.model";

export interface InventoryItemsQueryParams {
  branchId: number;
}

export async function inventoryItemsQuery(params: InventoryItemsQueryParams): Promise<InventoryItemModel[]> {
  const response = await apiClient.get<ApiResponseEnvelope<InventoryItemDto[]>>("/inventory/items", {
    params: { branchId: params.branchId },
  });
  const raw = response.data;
  const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
  return list.map(mapInventoryItemDtoToModel);

}
