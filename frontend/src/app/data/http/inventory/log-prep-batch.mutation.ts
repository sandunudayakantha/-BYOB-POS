import { apiClient } from "@/app/core/http/api-client";
import {
  mapLogPrepBatchInputToDto,
  mapKitchenPrepBatchDtoToModel,
  type KitchenPrepBatchDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { KitchenPrepBatchModel } from "@/app/models/inventory.model";

export interface LogPrepBatchMutationInput {
  branchId: number;
  prepDefinitionId: number;
  rawInputQuantity: number;
  actualYieldQuantity: number;
  wastageQuantity?: number;
  wastageReason?: string;
  prepImageUrl?: string;
  wastageImageUrl?: string;
}

export async function logPrepBatchMutation(input: LogPrepBatchMutationInput): Promise<KitchenPrepBatchModel> {
  const payload = mapLogPrepBatchInputToDto(input);
  const response = await apiClient.post<ApiResponseEnvelope<KitchenPrepBatchDto>>(
    "/inventory/preps/batches",
    payload,
    { params: { branchId: input.branchId } }
  );
  const raw = (response as any)?.data?.data || (response as any)?.data || response;
  return mapKitchenPrepBatchDtoToModel(raw);
}
