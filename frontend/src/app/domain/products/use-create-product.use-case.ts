import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductMutation, type CreateProductMutationInput } from "@/app/data/http/products/create-product.mutation";
import type { ProductModel } from "@/app/models/product.model";

export function useCreateProductUseCase(branchId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<ProductModel, Error, CreateProductMutationInput>({
    mutationFn: (input: CreateProductMutationInput) => createProductMutation(input),
    onSuccess: (_data, variables) => {
      const targetBranch = variables.branchId || branchId;
      if (targetBranch) {
        queryClient.invalidateQueries({ queryKey: ["products", targetBranch] });
        queryClient.invalidateQueries({ queryKey: ["ownerProducts", targetBranch] });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["ownerProducts"] });
    },
  });

  return {
    createProduct: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
