import { apiClient } from "@/app/core/http/api-client";

export interface DeleteProductMutationInput {
  productId: string;
}

export async function deleteProductMutation(input: DeleteProductMutationInput): Promise<void> {
  await apiClient.delete(`/products/${input.productId}`);
}
