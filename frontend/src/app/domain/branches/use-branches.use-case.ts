import { useQuery } from "@tanstack/react-query";
import { branchesQuery } from "@/app/data/http/branches/branches.query";
import type { BranchModel } from "@/app/models/branch.model";

export function useBranchesUseCase(options?: { enabled?: boolean }) {
  const query = useQuery<BranchModel[], Error>({
    queryKey: ["ownerBranches"],
    queryFn: () => branchesQuery(),
    enabled: options?.enabled ?? true,
  });

  return {
    branches: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
