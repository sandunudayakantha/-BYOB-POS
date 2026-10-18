import { apiClient } from "@/app/core/http/api-client";
import {
  mapCreateRestaurantInputToDto,
  mapRestaurantDtoToModel,
  type RestaurantDto,
} from "./restaurants.dto";
import type { RestaurantModel } from "@/app/models/restaurant.model";

export interface CreateRestaurantMutationInput {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword?: string;
  maxBranches?: number;
}

export async function createRestaurantMutation(
  input: CreateRestaurantMutationInput
): Promise<RestaurantModel> {
  const payload = mapCreateRestaurantInputToDto(input);
  const response = await apiClient.post<RestaurantDto | { data: RestaurantDto }>("/admin/restaurants", payload);
  const data = (response.data as any)?.data || response.data;
  return mapRestaurantDtoToModel(data);
}
