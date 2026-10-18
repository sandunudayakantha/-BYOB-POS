import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBranchMutation, type UpdateBranchMutationInput } from "@/app/data/http/branches/update-branch.mutation";
import type { BranchModel } from "@/app/models/branch.model";

export function useUpdateBranchUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<BranchModel, Error, UpdateBranchMutationInput>({
    mutationFn: (input: UpdateBranchMutationInput) => updateBranchMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerBranches"] });
    },
  });

  return {
    updateBranch: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
