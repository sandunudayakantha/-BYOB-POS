import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRawItemMutation,
  type CreateRawItemMutationInput,
} from "@/app/data/http/inventory/create-raw-item.mutation";
import type { InventoryItemModel } from "@/app/models/inventory.model";

export function useCreateRawItemUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<InventoryItemModel, Error, CreateRawItemMutationInput>({
    mutationFn: (input: CreateRawItemMutationInput) => createRawItemMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items", variables.branchId] });
    },
  });

  return {
    createRawItem: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
