import { apiClient } from "@/app/core/http/api-client";
import { mapBranchDtoToModel, type BranchDto } from "./branches.dto";
import type { BranchModel } from "@/app/models/branch.model";

export interface CreateBranchMutationInput {
  name: string;
  address?: string;
  phone?: string;
  isMain?: boolean;
  logoFile?: File;
  logoUrl?: string;
  coverFile?: File;
  coverUrl?: string;
}

export async function createBranchMutation(input: CreateBranchMutationInput): Promise<BranchModel> {
  const formData = new FormData();
  formData.append("name", input.name);
  if (input.address) formData.append("address", input.address);
  if (input.phone) formData.append("phone", input.phone);
  formData.append("isMain", String(Boolean(input.isMain)));

  if (input.logoFile) {
    formData.append("logo", input.logoFile);
  } else if (input.logoUrl) {
    formData.append("logo", input.logoUrl);
  }

  if (input.coverFile) {
    formData.append("coverImage", input.coverFile);
  } else if (input.coverUrl) {
    formData.append("coverImage", input.coverUrl);
  }

  const response = await apiClient.post<BranchDto | { data: BranchDto }>("/branches", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const data = (response.data as any)?.data || response.data;
  return mapBranchDtoToModel(data);
}
