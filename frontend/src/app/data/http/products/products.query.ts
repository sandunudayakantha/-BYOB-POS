import { apiClient } from "@/app/core/http/api-client";
import { mapProductDtoToModel, type ProductDto } from "./products.dto";
import type { ProductModel } from "@/app/models/product.model";

export interface ProductsQueryParams {
  branchId: string;
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export interface ProductsQueryResult {
  data: ProductModel[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function productsQuery(params: ProductsQueryParams): Promise<ProductsQueryResult> {
  const response = await apiClient.get<{
    data: ProductDto[];
    meta?: { total: number; page: number; limit: number; totalPages: number };
  }>("/products", {
    params: {
      branchId: params.branchId,
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || undefined,
      categoryId: params.categoryId || undefined,
    },
  });

  const rawList = response.data?.data || [];
  const meta = response.data?.meta || {
    total: rawList.length,
    page: params.page || 1,
    limit: params.limit || 10,
    totalPages: 1,
  };

  return {
    data: rawList.map(mapProductDtoToModel),
    meta,
  };
}
