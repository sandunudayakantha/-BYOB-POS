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
  const response: any = await apiClient.get("/products", {
    params: {
      branchId: params.branchId,
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || undefined,
      categoryId: params.categoryId || undefined,
    },
  });

  const rawList: ProductDto[] = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.data?.items)
    ? response.data.items
    : Array.isArray(response?.items)
    ? response.items
    : Array.isArray(response?.data?.data)
    ? response.data.data
    : Array.isArray(response)
    ? response
    : [];

  const limit = params.limit || 10;
  const page = params.page || 1;
  const total =
    response?.pagination?.total ??
    response?.data?.total ??
    response?.meta?.total ??
    response?.total ??
    rawList.length;

  const meta = {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };

  return {
    data: rawList.map(mapProductDtoToModel),
    meta,
  };
}
