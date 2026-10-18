import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductMutation, type CreateProductMutationInput } from "@/app/data/http/products/create-product.mutation";
import type { ProductModel } from "@/app/models/product.model";

export function useCreateProductUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<ProductModel, Error, CreateProductMutationInput>({
    mutationFn: (input: CreateProductMutationInput) => createProductMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ["ownerProducts", variables.branchId] });
    },
  });

  return {
    createProduct: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
