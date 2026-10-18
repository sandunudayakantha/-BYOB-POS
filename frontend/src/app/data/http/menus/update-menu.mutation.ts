import { apiClient } from "@/app/core/http/api-client";
import {
  mapUpdateMenuInputToDto,
  mapMenuDtoToModel,
  type MenuDto,
} from "./menus.dto";
import type { MenuModel } from "@/app/models/menu.model";

export interface UpdateMenuMutationInput {
  menuId: string;
  name: string;
  description?: string;
  status?: string;
  isBaseMenu?: boolean;
}

export async function updateMenuMutation(input: UpdateMenuMutationInput): Promise<MenuModel> {
  const payload = mapUpdateMenuInputToDto({
    name: input.name,
    description: input.description,
    status: input.status,
    isBaseMenu: input.isBaseMenu,
  });
  const response = await apiClient.put<MenuDto | { data: MenuDto }>(`/menus/${input.menuId}`, payload);
  const data = (response.data as any)?.data || response.data;
  return mapMenuDtoToModel(data);
}
