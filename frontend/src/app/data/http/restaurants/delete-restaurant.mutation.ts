import { apiClient } from "@/app/core/http/api-client";

export interface DeleteRestaurantMutationInput {
  restaurantId: string;
}

export async function deleteRestaurantMutation(input: DeleteRestaurantMutationInput): Promise<void> {
  await apiClient.delete(`/admin/restaurants/${input.restaurantId}`);
}
