import { apiClient } from "@/app/core/http/api-client";
import {
  mapInwardStockBatchInputToDto,
  mapRawInventoryBatchDtoToModel,
  type RawInventoryBatchDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { RawInventoryBatchModel } from "@/app/models/inventory.model";

export interface InwardStockBatchMutationInput {
  branchId: number;
  itemId: number;
  quantityReceived: number;
  unitCost: number;
  receivedDate?: string;
  expiryDate?: string;
  supplierId?: number;
  batchNumber?: string;
  notes?: string;
}

export async function inwardStockBatchMutation(input: InwardStockBatchMutationInput): Promise<RawInventoryBatchModel> {
  const payload = mapInwardStockBatchInputToDto(input);
  const response = await apiClient.post<ApiResponseEnvelope<RawInventoryBatchDto>>(
    `/inventory/items/${input.itemId}/batches`,
    payload,
    { params: { branchId: input.branchId } }
  );
  return mapRawInventoryBatchDtoToModel(response.data?.data);
}
