import { useQuery } from "@tanstack/react-query";
import { suppliersQuery } from "@/app/data/http/inventory/suppliers.query";
import type { SupplierModel } from "@/app/models/inventory.model";

export function useSuppliersUseCase(branchId?: number) {
  const query = useQuery<SupplierModel[]>({
    queryKey: ["suppliers", branchId],
    queryFn: () => suppliersQuery(branchId),
    enabled: Boolean(branchId && branchId > 0),
  });

  return {
    suppliers: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
