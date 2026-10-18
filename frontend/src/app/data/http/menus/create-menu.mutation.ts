import { apiClient } from "@/app/core/http/api-client";
import {
  mapCreateMenuInputToDto,
  mapMenuDtoToModel,
  type MenuDto,
} from "./menus.dto";
import type { MenuModel } from "@/app/models/menu.model";

export interface CreateMenuMutationInput {
  name: string;
  branchId: string;
  description?: string;
  status?: string;
  isBaseMenu?: boolean;
}

export async function createMenuMutation(input: CreateMenuMutationInput): Promise<MenuModel> {
  const payload = mapCreateMenuInputToDto(input);
  const response = await apiClient.post<MenuDto | { data: MenuDto }>("/menus", payload);
  const data = (response.data as any)?.data || response.data;
  return mapMenuDtoToModel(data);
}
