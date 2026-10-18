import { apiClient } from "@/app/core/http/api-client";
import { mapResetPasswordInputToDto } from "./restaurants.dto";

export interface ResetRestaurantPasswordMutationInput {
  restaurantId: string;
  newPassword: string;
}

export async function resetRestaurantPasswordMutation(
  input: ResetRestaurantPasswordMutationInput
): Promise<any> {
  const payload = mapResetPasswordInputToDto({ newPassword: input.newPassword });
  const response = await apiClient.post(`/admin/restaurants/${input.restaurantId}/reset-password`, payload);
  return response.data;
}
