import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  logPrepBatchMutation,
  type LogPrepBatchMutationInput,
} from "@/app/data/http/inventory/log-prep-batch.mutation";
import type { KitchenPrepBatchModel } from "@/app/models/inventory.model";

export function useLogPrepBatchUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<KitchenPrepBatchModel, Error, LogPrepBatchMutationInput>({
    mutationFn: (input: LogPrepBatchMutationInput) => logPrepBatchMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "preps", "batches", variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "preps", "definitions", variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "items", variables.branchId] });
    },
  });

  return {
    logPrepBatch: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
