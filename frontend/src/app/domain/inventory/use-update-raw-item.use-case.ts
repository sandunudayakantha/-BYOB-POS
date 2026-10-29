import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateRawItemMutation,
  type UpdateRawItemMutationInput,
} from "@/app/data/http/inventory/update-raw-item.mutation";
import type { InventoryItemModel } from "@/app/models/inventory.model";

export function useUpdateRawItemUseCase(branchId?: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation<InventoryItemModel, Error, UpdateRawItemMutationInput>({
    mutationFn: (input: UpdateRawItemMutationInput) => updateRawItemMutation(input),
    onSuccess: () => {
      if (branchId) {
        queryClient.invalidateQueries({ queryKey: ["inventory", "items", branchId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      }
    },
  });

  return {
    updateRawItem: mutation.mutateAsync,
    mutateAsync: mutation.mutateAsync,
    mutate: mutation.mutate,
    isSubmitting: mutation.isPending,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
