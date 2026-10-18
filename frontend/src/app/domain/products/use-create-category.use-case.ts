import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategoryMutation, type CreateCategoryMutationInput } from "@/app/data/http/products/create-category.mutation";
import type { CategoryModel } from "@/app/models/product.model";

export function useCreateCategoryUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CategoryModel, Error, CreateCategoryMutationInput>({
    mutationFn: (input: CreateCategoryMutationInput) => createCategoryMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories", variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ["ownerCategories", variables.branchId] });
    },
  });

  return {
    createCategory: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
