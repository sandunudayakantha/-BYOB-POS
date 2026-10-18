import { useQuery } from "@tanstack/react-query";
import { prepDefinitionsQuery, type PrepDefinitionsQueryParams } from "@/app/data/http/inventory/prep-definitions.query";
import type { KitchenPrepDefinitionModel } from "@/app/models/inventory.model";

export function usePrepDefinitionsUseCase(params: PrepDefinitionsQueryParams) {
  const query = useQuery<KitchenPrepDefinitionModel[], Error>({
    queryKey: ["inventory", "preps", "definitions", params.branchId, params.rawItemId],
    queryFn: () => prepDefinitionsQuery(params),
    enabled: Boolean(params.branchId),
  });

  return {
    prepDefinitions: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
