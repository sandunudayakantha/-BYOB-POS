import { useQuery } from "@tanstack/react-query";
import { branchesQuery } from "@/app/data/http/branches/branches.query";
import type { BranchModel } from "@/app/models/branch.model";

export function useBranchesUseCase() {
  const query = useQuery<BranchModel[], Error>({
    queryKey: ["ownerBranches"],
    queryFn: () => branchesQuery(),
  });

  return {
    branches: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
