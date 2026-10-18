import { apiClient } from "@/app/core/http/api-client";
import {
  mapUpdateMenuItemInputToDto,
  mapMenuItemDtoToModel,
  type MenuItemDto,
} from "./menus.dto";
import type { MenuItemModel } from "@/app/models/menu.model";

export interface UpdateMenuItemMutationInput {
  itemId: string;
  price?: number;
  isAvailable?: boolean;
}

export async function updateMenuItemMutation(input: UpdateMenuItemMutationInput): Promise<MenuItemModel> {
  const payload = mapUpdateMenuItemInputToDto({
    price: input.price,
    isAvailable: input.isAvailable,
  });
  const response = await apiClient.put<MenuItemDto | { data: MenuItemDto }>(`/menu-items/${input.itemId}`, payload);
  const data = (response.data as any)?.data || response.data;
  return mapMenuItemDtoToModel(data);
}
