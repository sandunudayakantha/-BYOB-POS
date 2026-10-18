import { useQuery } from "@tanstack/react-query";
import { qrcodesQuery, type QRCodesQueryParams } from "@/app/data/http/qrcodes/qrcodes.query";
import type { QRCodeModel } from "@/app/models/qrcode.model";

export function useQRCodesUseCase(params: QRCodesQueryParams) {
  const query = useQuery<QRCodeModel[], Error>({
    queryKey: ["ownerQRCodes", params.branchId],
    queryFn: () => qrcodesQuery(params),
    enabled: Boolean(params.branchId),
  });

  return {
    qrCodes: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
