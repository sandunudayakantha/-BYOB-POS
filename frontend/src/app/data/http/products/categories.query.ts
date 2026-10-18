import { apiClient } from "@/app/core/http/api-client";
import { mapCategoryDtoToModel, type CategoryDto } from "./products.dto";
import type { CategoryModel } from "@/app/models/product.model";

export interface CategoriesQueryParams {
  branchId: string;
}

export async function categoriesQuery(params: CategoriesQueryParams): Promise<CategoryModel[]> {
  const response = await apiClient.get<CategoryDto[] | { data: CategoryDto[] }>("/categories", {
    params: {
      branchId: params.branchId,
    },
  });

  const rawList = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
  return rawList.map(mapCategoryDtoToModel);
}
