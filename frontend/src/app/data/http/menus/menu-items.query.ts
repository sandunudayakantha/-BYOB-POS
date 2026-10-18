import { apiClient } from "@/app/core/http/api-client";
import { mapMenuItemDtoToModel, type MenuItemDto } from "./menus.dto";
import type { MenuItemModel } from "@/app/models/menu.model";

export interface MenuItemsQueryParams {
  menuId: string;
}

export async function menuItemsQuery(params: MenuItemsQueryParams): Promise<MenuItemModel[]> {
  const response = await apiClient.get<MenuItemDto[] | { data: MenuItemDto[] }>("/menu-items", {
    params: {
      menuId: params.menuId,
    },
  });

  const rawList = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
  return rawList.map(mapMenuItemDtoToModel);
}
