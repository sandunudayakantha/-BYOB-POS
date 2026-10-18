import { apiClient } from "@/app/core/http/api-client";
import {
  mapCreatePrepDefinitionInputToDto,
  mapKitchenPrepDefinitionDtoToModel,
  type KitchenPrepDefinitionDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { KitchenPrepDefinitionModel } from "@/app/models/inventory.model";

export interface CreatePrepDefinitionMutationInput {
  branchId: number;
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
}

export async function createPrepDefinitionMutation(input: CreatePrepDefinitionMutationInput): Promise<KitchenPrepDefinitionModel> {
  const payload = mapCreatePrepDefinitionInputToDto(input);
  const response = await apiClient.post<ApiResponseEnvelope<KitchenPrepDefinitionDto>>(
    "/inventory/preps/definitions",
    payload,
    { params: { branchId: input.branchId } }
  );
  return mapKitchenPrepDefinitionDtoToModel(response.data?.data);
}
