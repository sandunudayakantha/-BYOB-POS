import { apiClient } from "@/app/core/http/api-client";
import { mapRestaurantDtoToModel, type RestaurantDto } from "./restaurants.dto";
import type { RestaurantModel } from "@/app/models/restaurant.model";

export async function restaurantsQuery(): Promise<RestaurantModel[]> {
  const response = await apiClient.get<RestaurantDto[] | { data: RestaurantDto[] }>("/admin/restaurants");
  const rawList = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
  return rawList.map(mapRestaurantDtoToModel);
}
