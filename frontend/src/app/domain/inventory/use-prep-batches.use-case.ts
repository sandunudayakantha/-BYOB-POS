import { useQuery } from "@tanstack/react-query";
import { prepBatchesQuery, type PrepBatchesQueryParams } from "@/app/data/http/inventory/prep-batches.query";
import type { KitchenPrepBatchModel } from "@/app/models/inventory.model";

export function usePrepBatchesUseCase(params: PrepBatchesQueryParams) {
  const query = useQuery<KitchenPrepBatchModel[], Error>({
    queryKey: ["inventory", "preps", "batches", params.branchId],
    queryFn: () => prepBatchesQuery(params),
    enabled: Boolean(params.branchId && params.branchId > 0),
  });

  return {
    prepBatches: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
