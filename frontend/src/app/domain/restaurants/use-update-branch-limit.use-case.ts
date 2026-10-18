import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBranchLimitMutation,
  type UpdateBranchLimitMutationInput,
} from "@/app/data/http/restaurants/update-branch-limit.mutation";

export function useUpdateBranchLimitUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, UpdateBranchLimitMutationInput>({
    mutationFn: (input: UpdateBranchLimitMutationInput) => updateBranchLimitMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRestaurants"] });
    },
  });

  return {
    updateBranchLimit: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
