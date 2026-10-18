import { apiClient } from "@/app/core/http/api-client";
import {
  mapKitchenPrepDefinitionDtoToModel,
  type KitchenPrepDefinitionDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { KitchenPrepDefinitionModel } from "@/app/models/inventory.model";

export interface PrepDefinitionsQueryParams {
  branchId: number;
  rawItemId?: number;
}

export async function prepDefinitionsQuery(params: PrepDefinitionsQueryParams): Promise<KitchenPrepDefinitionModel[]> {
  const queryParams: Record<string, unknown> = { branchId: params.branchId };
  if (params.rawItemId) queryParams.rawItemId = params.rawItemId;

  const response = await apiClient.get<ApiResponseEnvelope<KitchenPrepDefinitionDto[]>>("/inventory/preps/definitions", {
    params: queryParams,
  });
  const raw = response.data;
  const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
  return list.map(mapKitchenPrepDefinitionDtoToModel);

}
