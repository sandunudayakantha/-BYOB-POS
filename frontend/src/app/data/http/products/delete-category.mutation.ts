import { apiClient } from "@/app/core/http/api-client";

export interface DeleteCategoryMutationInput {
  categoryId: string;
}

export async function deleteCategoryMutation(input: DeleteCategoryMutationInput): Promise<void> {
  await apiClient.delete(`/categories/${input.categoryId}`);
}
