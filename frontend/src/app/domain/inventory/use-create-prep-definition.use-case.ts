import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPrepDefinitionMutation,
  type CreatePrepDefinitionMutationInput,
} from "@/app/data/http/inventory/create-prep-definition.mutation";
import type { KitchenPrepDefinitionModel } from "@/app/models/inventory.model";

export function useCreatePrepDefinitionUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<KitchenPrepDefinitionModel, Error, CreatePrepDefinitionMutationInput>({
    mutationFn: (input: CreatePrepDefinitionMutationInput) => createPrepDefinitionMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "preps", "definitions", variables.branchId] });
    },
  });

  return {
    createPrepDefinition: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
