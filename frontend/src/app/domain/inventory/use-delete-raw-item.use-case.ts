import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteRawItemMutation,
  type DeleteRawItemMutationInput,
} from "@/app/data/http/inventory/delete-raw-item.mutation";

export interface UseDeleteRawItemParams {
  branchId?: number;
}

export function useDeleteRawItemUseCase(params?: UseDeleteRawItemParams) {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DeleteRawItemMutationInput>({
    mutationFn: (input: DeleteRawItemMutationInput) => deleteRawItemMutation(input),
    onSuccess: () => {
      if (params?.branchId) {
        queryClient.invalidateQueries({ queryKey: ["inventory", "items", params.branchId] });
      }
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
    },
  });

  return {
    deleteRawItem: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
