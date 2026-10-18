import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategoryMutation, type UpdateCategoryMutationInput } from "@/app/data/http/products/update-category.mutation";
import type { CategoryModel } from "@/app/models/product.model";

export function useUpdateCategoryUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CategoryModel, Error, UpdateCategoryMutationInput>({
    mutationFn: (input: UpdateCategoryMutationInput) => updateCategoryMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["ownerCategories"] });
    },
  });

  return {
    updateCategory: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
