import { apiClient } from "@/app/core/http/api-client";
import {
  mapKitchenPrepBatchDtoToModel,
  type KitchenPrepBatchDto,
} from "./inventory.dto";
import type { ApiResponseEnvelope, PaginatedResponseDto } from "../dto/api-response.dto";
import type { KitchenPrepBatchModel } from "@/app/models/inventory.model";

export interface PrepBatchesQueryParams {
  branchId: number;
  rawItemId?: number | null;
  prepDefinitionId?: number | null;
  search?: string | null;
  onlyWastage?: boolean;
  page?: number | null;
  limit?: number | null;
}

export interface PrepBatchesQueryResult {
  items: KitchenPrepBatchModel[];
  total: number;
  skip?: number;
  limit?: number;
}

export async function prepBatchesQuery(
  params: PrepBatchesQueryParams
): Promise<PrepBatchesQueryResult> {
  const queryParams: Record<string, string | number | boolean> = { branchId: params.branchId };
  if (params.rawItemId) queryParams.rawItemId = params.rawItemId;
  if (params.prepDefinitionId) queryParams.prepDefinitionId = params.prepDefinitionId;
  if (params.search && params.search.trim()) queryParams.search = params.search.trim();
  if (params.onlyWastage) queryParams.onlyWastage = true;
  if (params.page !== undefined && params.page !== null) queryParams.page = params.page;
  if (params.limit !== undefined && params.limit !== null) queryParams.limit = params.limit;

  const response = await apiClient.get<ApiResponseEnvelope<KitchenPrepBatchDto[] | PaginatedResponseDto<KitchenPrepBatchDto>>>(
    "/inventory/preps/batches",
    { params: queryParams }
  );

  const raw = response.data;
  const payload = (raw && typeof raw === "object" && "data" in raw) ? (raw as ApiResponseEnvelope<any>).data : raw;

  if (payload && typeof payload === "object" && "items" in payload && Array.isArray((payload as any).items)) {
    const paginated = payload as PaginatedResponseDto<KitchenPrepBatchDto>;
    return {
      items: paginated.items.map(mapKitchenPrepBatchDtoToModel),
      total: paginated.total ?? paginated.items.length,
      skip: paginated.skip,
      limit: paginated.limit,
    };
  }

  const list = Array.isArray(payload) ? (payload as KitchenPrepBatchDto[]) : [];
  const items = list.map(mapKitchenPrepBatchDtoToModel);
  return {
    items,
    total: items.length,
  };
}
