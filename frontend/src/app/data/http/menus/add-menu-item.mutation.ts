import { apiClient } from "@/app/core/http/api-client";
import {
  mapAddMenuItemInputToDto,
  mapMenuItemDtoToModel,
  type MenuItemDto,
} from "./menus.dto";
import type { MenuItemModel } from "@/app/models/menu.model";

export interface AddMenuItemMutationInput {
  menuId: string;
  productId: string;
  price: number;
}

export async function addMenuItemMutation(input: AddMenuItemMutationInput): Promise<MenuItemModel> {
  const payload = mapAddMenuItemInputToDto(input);
  const response = await apiClient.post<MenuItemDto | { data: MenuItemDto }>("/menu-items", payload);
  const data = (response.data as any)?.data || response.data;
  return mapMenuItemDtoToModel(data);
}
