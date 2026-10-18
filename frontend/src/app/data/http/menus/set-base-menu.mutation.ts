import { apiClient } from "@/app/core/http/api-client";

export interface SetBaseMenuMutationInput {
  menuId: string;
}

export async function setBaseMenuMutation(input: SetBaseMenuMutationInput): Promise<any> {
  const response = await apiClient.patch(`/menus/${input.menuId}/base`);
  return response.data;
}
