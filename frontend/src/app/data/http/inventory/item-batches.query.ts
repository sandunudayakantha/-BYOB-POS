import { apiClient } from "@/app/core/http/api-client";
import {
  mapRawInventoryBatchDtoToModel,
  type RawInventoryBatchDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { RawInventoryBatchModel } from "@/app/models/inventory.model";

export interface ItemBatchesQueryParams {
  itemId: number;
}

export async function itemBatchesQuery(params: ItemBatchesQueryParams): Promise<RawInventoryBatchModel[]> {
  const response = await apiClient.get<ApiResponseEnvelope<RawInventoryBatchDto[]>>(`/inventory/items/${params.itemId}/batches`);
  const raw = response.data;
  const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
  return list.map(mapRawInventoryBatchDtoToModel);

}
