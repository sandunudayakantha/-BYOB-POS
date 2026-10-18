import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateRawItemMutation,
  type UpdateRawItemMutationInput,
} from "@/app/data/http/inventory/update-raw-item.mutation";
import type { InventoryItemModel } from "@/app/models/inventory.model";

export function useUpdateRawItemUseCase(branchId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation<InventoryItemModel, Error, UpdateRawItemMutationInput>({
    mutationFn: (input: UpdateRawItemMutationInput) => updateRawItemMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items", branchId] });
    },
  });

  return {
    updateRawItem: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
