import { apiClient } from "@/app/core/http/api-client";
import { mapToggleQRStatusInputToDto } from "./qrcodes.dto";

export interface ToggleQRStatusMutationInput {
  qrId: string;
  isActive: boolean;
}

export async function toggleQrStatusMutation(input: ToggleQRStatusMutationInput): Promise<any> {
  const payload = mapToggleQRStatusInputToDto({ isActive: input.isActive });
  const response = await apiClient.patch(`/qr/${input.qrId}/status`, payload);
  return response.data;
}
