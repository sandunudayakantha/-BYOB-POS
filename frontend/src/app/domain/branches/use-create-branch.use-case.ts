import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBranchMutation, type CreateBranchMutationInput } from "@/app/data/http/branches/create-branch.mutation";
import type { BranchModel } from "@/app/models/branch.model";

export function useCreateBranchUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<BranchModel, Error, CreateBranchMutationInput>({
    mutationFn: (input: CreateBranchMutationInput) => createBranchMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerBranches"] });
    },
  });

  return {
    createBranch: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
