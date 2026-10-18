import { apiClient } from "@/app/core/http/api-client";
import { mapQRCodeDtoToModel, type QRCodeDto } from "./qrcodes.dto";
import type { QRCodeModel } from "@/app/models/qrcode.model";

export interface QRCodesQueryParams {
  branchId: string;
}

export async function qrcodesQuery(params: QRCodesQueryParams): Promise<QRCodeModel[]> {
  const response = await apiClient.get<QRCodeDto[] | { data: QRCodeDto[] }>("/qr", {
    params: {
      branchId: params.branchId,
    },
  });

  const rawList = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
  return rawList.map(mapQRCodeDtoToModel);
}
