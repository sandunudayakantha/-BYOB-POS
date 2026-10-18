import { apiClient } from "@/app/core/http/api-client";

export interface RemoveMenuItemMutationInput {
  itemId: string;
}

export async function removeMenuItemMutation(input: RemoveMenuItemMutationInput): Promise<void> {
  await apiClient.delete(`/menu-items/${input.itemId}`);
}
