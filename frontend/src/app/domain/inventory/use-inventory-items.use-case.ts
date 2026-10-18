import { useQuery } from "@tanstack/react-query";
import { inventoryItemsQuery, type InventoryItemsQueryParams } from "@/app/data/http/inventory/inventory-items.query";
import type { InventoryItemModel } from "@/app/models/inventory.model";

export function useInventoryItemsUseCase(params: InventoryItemsQueryParams) {
  const query = useQuery<InventoryItemModel[], Error>({
    queryKey: ["inventory", "items", params.branchId],
    queryFn: () => inventoryItemsQuery(params),
    enabled: Boolean(params.branchId),
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
