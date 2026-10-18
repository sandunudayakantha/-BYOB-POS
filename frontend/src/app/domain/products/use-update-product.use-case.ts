import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductMutation, type UpdateProductMutationInput } from "@/app/data/http/products/update-product.mutation";
import type { ProductModel } from "@/app/models/product.model";

export function useUpdateProductUseCase(branchId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<ProductModel, Error, UpdateProductMutationInput>({
    mutationFn: (input: UpdateProductMutationInput) => updateProductMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", branchId] });
      queryClient.invalidateQueries({ queryKey: ["ownerProducts", branchId] });
    },
  });

  return {
    updateProduct: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
