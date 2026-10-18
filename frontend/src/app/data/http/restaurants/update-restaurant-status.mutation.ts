import { apiClient } from "@/app/core/http/api-client";
import { mapUpdateRestaurantStatusInputToDto } from "./restaurants.dto";

export interface UpdateRestaurantStatusMutationInput {
  restaurantId: string;
  status: string;
}

export async function updateRestaurantStatusMutation(
  input: UpdateRestaurantStatusMutationInput
): Promise<any> {
  const payload = mapUpdateRestaurantStatusInputToDto({ status: input.status });
  const response = await apiClient.patch(`/admin/restaurants/${input.restaurantId}/status`, payload);
  return response.data;
}
