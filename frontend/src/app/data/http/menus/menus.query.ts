import { apiClient } from "@/app/core/http/api-client";
import { mapMenuDtoToModel, type MenuDto } from "./menus.dto";
import type { MenuModel } from "@/app/models/menu.model";

export interface MenusQueryParams {
  branchId: string;
}

export async function menusQuery(params: MenusQueryParams): Promise<MenuModel[]> {
  const response = await apiClient.get<MenuDto[] | { data: MenuDto[] }>("/menus", {
    params: {
      branchId: params.branchId,
    },
  });

  const rawList = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
  return rawList.map(mapMenuDtoToModel);
}
