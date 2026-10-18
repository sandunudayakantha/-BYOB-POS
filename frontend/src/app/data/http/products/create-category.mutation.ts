import { apiClient } from "@/app/core/http/api-client";
import {
  mapCreateCategoryInputToDto,
  mapCategoryDtoToModel,
  type CategoryDto,
} from "./products.dto";
import type { CategoryModel } from "@/app/models/product.model";

export interface CreateCategoryMutationInput {
  name: string;
  branchId: string;
  sortOrder?: number;
}

export async function createCategoryMutation(input: CreateCategoryMutationInput): Promise<CategoryModel> {
  const payload = mapCreateCategoryInputToDto(input);
  const response = await apiClient.post<CategoryDto | { data: CategoryDto }>("/categories", payload);
  const data = (response.data as any)?.data || response.data;
  return mapCategoryDtoToModel(data);
}
