import { apiClient } from "@/app/core/http/api-client";
import {
  mapCreateQRCodeInputToDto,
  mapQRCodeDtoToModel,
  type QRCodeDto,
} from "./qrcodes.dto";
import type { QRCodeModel } from "@/app/models/qrcode.model";

export interface CreateQRCodeMutationInput {
  branchId: string;
  menuId?: string;
  tableName?: string;
}

export async function createQRCodeMutation(input: CreateQRCodeMutationInput): Promise<QRCodeModel> {
  const payload = mapCreateQRCodeInputToDto(input);
  const response = await apiClient.post<QRCodeDto | { data: QRCodeDto }>("/qr", payload);
  const data = (response.data as any)?.data || response.data;
  return mapQRCodeDtoToModel(data);
}
