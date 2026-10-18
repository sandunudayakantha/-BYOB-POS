import { apiClient } from "@/app/core/http/api-client";
import { mapChangePasswordInputToDto } from "./auth.dto";

export interface ChangePasswordMutationInput {
  currentPassword?: string;
  newPassword?: string;
}

export async function changePasswordMutation(input: ChangePasswordMutationInput): Promise<any> {
  const payload = mapChangePasswordInputToDto(input);
  const response = await apiClient.put("/auth/change-password", payload);
  return response.data;
}
