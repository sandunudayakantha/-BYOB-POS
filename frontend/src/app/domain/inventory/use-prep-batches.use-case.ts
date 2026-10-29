import { useQuery } from "@tanstack/react-query";
import {
  prepBatchesQuery,
  type PrepBatchesQueryParams,
  type PrepBatchesQueryResult,
} from "@/app/data/http/inventory/prep-batches.query";

export function usePrepBatchesUseCase(params: PrepBatchesQueryParams) {
  const query = useQuery<PrepBatchesQueryResult, Error>({
    queryKey: [
      "inventory",
      "preps",
      "batches",
      params.branchId,
      params.rawItemId ?? null,
      params.prepDefinitionId ?? null,
      params.search ?? "",
      params.onlyWastage ?? false,
      params.page ?? null,
      params.limit ?? null,
    ],
    queryFn: () => prepBatchesQuery(params),
    enabled: Boolean(params.branchId && params.branchId > 0),
  });

  return {
    prepBatches: query.data?.items || [],
    total: query.data?.total || 0,
    skip: query.data?.skip,
    limit: query.data?.limit,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
