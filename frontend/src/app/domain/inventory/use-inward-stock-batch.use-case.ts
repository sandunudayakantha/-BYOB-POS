import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inwardStockBatchMutation,
  type InwardStockBatchMutationInput,
} from "@/app/data/http/inventory/inward-stock-batch.mutation";
import type { RawInventoryBatchModel } from "@/app/models/inventory.model";

export function useInwardStockBatchUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<RawInventoryBatchModel, Error, InwardStockBatchMutationInput>({
    mutationFn: (input: InwardStockBatchMutationInput) => inwardStockBatchMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "batches", variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "items", variables.branchId] });
    },
  });

  return {
    inwardStockBatch: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
