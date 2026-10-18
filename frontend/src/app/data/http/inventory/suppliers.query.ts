import { apiClient } from "@/app/core/http/api-client";
import { mapSupplierDtoToModel, type SupplierDto } from "./inventory.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { SupplierModel } from "@/app/models/inventory.model";

export async function suppliersQuery(branchId?: number): Promise<SupplierModel[]> {
  const response = await apiClient.get<ApiResponseEnvelope<SupplierDto[]>>("/inventory/suppliers", {
    params: branchId ? { branchId } : undefined,
  });
  const list = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
  return list.map(mapSupplierDtoToModel);
}
