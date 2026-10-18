import { apiClient } from "@/app/core/http/api-client";

export interface DeleteMenuMutationInput {
  menuId: string;
}

export async function deleteMenuMutation(input: DeleteMenuMutationInput): Promise<void> {
  await apiClient.delete(`/menus/${input.menuId}`);
}
