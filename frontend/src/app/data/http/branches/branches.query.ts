import { apiClient } from "@/app/core/http/api-client";
import { mapBranchDtoToModel, type BranchDto } from "./branches.dto";
import type { BranchModel } from "@/app/models/branch.model";

export async function branchesQuery(): Promise<BranchModel[]> {
  const response = await apiClient.get<BranchDto[] | { data: BranchDto[] }>("/branches");
  const rawList = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
  return rawList.map(mapBranchDtoToModel);
}
