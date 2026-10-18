import { apiClient } from "@/app/core/http/api-client";

export interface DeleteQRCodeMutationInput {
  qrId: string;
}

export async function deleteQrCodeMutation(input: DeleteQRCodeMutationInput): Promise<void> {
  await apiClient.delete(`/qr/${input.qrId}`);
}
