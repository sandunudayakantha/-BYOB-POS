import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updatePrepDefinitionMutation,
  type UpdatePrepDefinitionMutationInput,
} from "@/app/data/http/inventory/update-prep-definition.mutation";
import type { KitchenPrepDefinitionModel } from "@/app/models/inventory.model";

export function useUpdatePrepDefinitionUseCase(branchId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation<KitchenPrepDefinitionModel, Error, UpdatePrepDefinitionMutationInput>({
    mutationFn: (input: UpdatePrepDefinitionMutationInput) => updatePrepDefinitionMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "preps", "definitions", branchId] });
    },
  });

  return {
    updatePrepDefinition: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
