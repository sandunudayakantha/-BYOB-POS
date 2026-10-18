import { apiClient } from "@/app/core/http/api-client";
import {
  mapUpdateCategoryInputToDto,
  mapCategoryDtoToModel,
  type CategoryDto,
} from "./products.dto";
import type { CategoryModel } from "@/app/models/product.model";

export interface UpdateCategoryMutationInput {
  categoryId: string;
  name: string;
  sortOrder?: number;
}

export async function updateCategoryMutation(input: UpdateCategoryMutationInput): Promise<CategoryModel> {
  const payload = mapUpdateCategoryInputToDto({
    name: input.name,
    sortOrder: input.sortOrder,
  });
  const response = await apiClient.put<CategoryDto | { data: CategoryDto }>(`/categories/${input.categoryId}`, payload);
  const data = (response.data as any)?.data || response.data;
  return mapCategoryDtoToModel(data);
}
