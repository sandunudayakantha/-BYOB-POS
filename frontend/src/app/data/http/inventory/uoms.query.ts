import { apiClient } from "@/app/core/http/api-client";
import { mapUomDtoToModel, type UnitOfMeasureDto } from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { UnitOfMeasureModel } from "@/app/models/inventory.model";

export async function uomsQuery(): Promise<UnitOfMeasureModel[]> {
  const response = await apiClient.get<ApiResponseEnvelope<UnitOfMeasureDto[]>>("/inventory/uoms");
  const list = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
  return list.map(mapUomDtoToModel);
}
