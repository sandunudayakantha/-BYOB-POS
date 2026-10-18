import { useQuery } from "@tanstack/react-query";
import { uomsQuery } from "@/app/data/http/inventory/uoms.query";
import type { UnitOfMeasureModel } from "@/app/models/inventory.model";

export function useUomsUseCase() {
  const query = useQuery<UnitOfMeasureModel[]>({
    queryKey: ["uoms"],
    queryFn: () => uomsQuery(),
  });

  return {
    uoms: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
