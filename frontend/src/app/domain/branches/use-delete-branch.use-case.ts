import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBranchMutation, type DeleteBranchMutationInput } from "@/app/data/http/branches/delete-branch.mutation";

export function useDeleteBranchUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DeleteBranchMutationInput>({
    mutationFn: (input: DeleteBranchMutationInput) => deleteBranchMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerBranches"] });
    },
  });

  return {
    deleteBranch: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
