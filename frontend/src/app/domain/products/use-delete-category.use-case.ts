import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategoryMutation, type DeleteCategoryMutationInput } from "@/app/data/http/products/delete-category.mutation";

export function useDeleteCategoryUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DeleteCategoryMutationInput>({
    mutationFn: (input: DeleteCategoryMutationInput) => deleteCategoryMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["ownerCategories"] });
    },
  });

  return {
    deleteCategory: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
