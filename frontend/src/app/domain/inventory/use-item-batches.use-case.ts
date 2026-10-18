import { useQuery } from "@tanstack/react-query";
import { itemBatchesQuery, type ItemBatchesQueryParams } from "@/app/data/http/inventory/item-batches.query";
import type { RawInventoryBatchModel } from "@/app/models/inventory.model";

export function useItemBatchesUseCase(params: ItemBatchesQueryParams) {
  const query = useQuery<RawInventoryBatchModel[], Error>({
    queryKey: ["inventory", "batches", params.itemId],
    queryFn: () => itemBatchesQuery(params),
    enabled: Boolean(params.itemId),
  });

  return {
    batches: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
