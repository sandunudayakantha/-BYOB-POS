import { apiClient } from "@/app/core/http/api-client";
import { mapUpdateBranchLimitInputToDto } from "./restaurants.dto";

export interface UpdateBranchLimitMutationInput {
  restaurantId: string;
  maxBranches: number;
}

export async function updateBranchLimitMutation(
  input: UpdateBranchLimitMutationInput
): Promise<any> {
  const payload = mapUpdateBranchLimitInputToDto({ maxBranches: input.maxBranches });
  const response = await apiClient.patch(`/admin/restaurants/${input.restaurantId}/branch-limit`, payload);
  return response.data;
}
