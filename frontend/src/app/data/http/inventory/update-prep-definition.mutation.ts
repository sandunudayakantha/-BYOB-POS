import { apiClient } from "@/app/core/http/api-client";
import {
  mapUpdatePrepDefinitionInputToDto,
  mapKitchenPrepDefinitionDtoToModel,
  type KitchenPrepDefinitionDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { KitchenPrepDefinitionModel } from "@/app/models/inventory.model";

export interface UpdatePrepDefinitionMutationInput {
  prepId: number;
  name?: string;
  description?: string;
  uomId?: number;
  portionSizeValue?: number;
  portionSizeUomId?: number;
  expectedYieldPercent?: number;
  requiresImageEvidence?: boolean;
  trackWastage?: boolean;
  requiresWastageImage?: boolean;
}

export async function updatePrepDefinitionMutation(input: UpdatePrepDefinitionMutationInput): Promise<KitchenPrepDefinitionModel> {
  const payload = mapUpdatePrepDefinitionInputToDto(input);
  const response = await apiClient.put<ApiResponseEnvelope<KitchenPrepDefinitionDto>>(
    `/inventory/preps/definitions/${input.prepId}`,
    payload
  );
  const raw = (response as any)?.data?.data || (response as any)?.data || response;
  return mapKitchenPrepDefinitionDtoToModel(raw);
}
