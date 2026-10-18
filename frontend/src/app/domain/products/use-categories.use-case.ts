import { useQuery } from "@tanstack/react-query";
import { categoriesQuery, type CategoriesQueryParams } from "@/app/data/http/products/categories.query";
import type { CategoryModel } from "@/app/models/product.model";

export function useCategoriesUseCase(params: CategoriesQueryParams) {
  const query = useQuery<CategoryModel[], Error>({
    queryKey: ["categories", params.branchId],
    queryFn: () => categoriesQuery(params),
    enabled: Boolean(params.branchId),
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
