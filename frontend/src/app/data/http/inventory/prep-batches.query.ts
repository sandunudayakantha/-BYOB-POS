import { apiClient } from "@/app/core/http/api-client";
import {
  mapKitchenPrepBatchDtoToModel,
  type KitchenPrepBatchDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { KitchenPrepBatchModel } from "@/app/models/inventory.model";

export interface PrepBatchesQueryParams {
  branchId: number;
}

export async function prepBatchesQuery(params: PrepBatchesQueryParams): Promise<KitchenPrepBatchModel[]> {
  const response = await apiClient.get<ApiResponseEnvelope<KitchenPrepBatchDto[]>>("/inventory/preps/batches", {
    params: { branchId: params.branchId },
  });
  const raw = response.data;
  const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
  return list.map(mapKitchenPrepBatchDtoToModel);

}
