import { apiClient } from "@/app/core/http/api-client";

export interface DeleteRawItemMutationInput {
  itemId: number;
}

export async function deleteRawItemMutation(input: DeleteRawItemMutationInput): Promise<void> {
  await apiClient.delete(`/inventory/items/${input.itemId}`);
}
