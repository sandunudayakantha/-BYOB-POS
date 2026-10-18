import { useQuery } from "@tanstack/react-query";
import { productsQuery, type ProductsQueryParams, type ProductsQueryResult } from "@/app/data/http/products/products.query";

export function useProductsUseCase(params: ProductsQueryParams) {
  const query = useQuery<ProductsQueryResult, Error>({
    queryKey: ["products", params.branchId, params.page, params.limit, params.search, params.categoryId],
    queryFn: () => productsQuery(params),
    enabled: Boolean(params.branchId),
  });

  return {
    products: query.data?.data || [],
    meta: query.data?.meta || { total: 0, page: 1, limit: params.limit || 10, totalPages: 1 },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
