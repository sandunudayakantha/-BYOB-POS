import { apiClient } from "@/app/core/http/api-client";
import { mapReorderMenuItemsInputToDto } from "./menus.dto";

export interface ReorderMenuItemsMutationInput {
  items: { id: string; displayOrder: number }[];
}

export async function reorderMenuItemsMutation(input: ReorderMenuItemsMutationInput): Promise<any> {
  const payload = mapReorderMenuItemsInputToDto(input);
  const response = await apiClient.put("/menu-items/reorder", payload);
  return response.data;
}
