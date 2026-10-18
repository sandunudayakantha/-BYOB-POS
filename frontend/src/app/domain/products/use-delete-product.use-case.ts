import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductMutation, type DeleteProductMutationInput } from "@/app/data/http/products/delete-product.mutation";

export function useDeleteProductUseCase(branchId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DeleteProductMutationInput>({
    mutationFn: (input: DeleteProductMutationInput) => deleteProductMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", branchId] });
      queryClient.invalidateQueries({ queryKey: ["ownerProducts", branchId] });
    },
  });

  return {
    deleteProduct: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
