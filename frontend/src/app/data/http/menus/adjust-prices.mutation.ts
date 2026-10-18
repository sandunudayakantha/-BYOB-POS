import { apiClient } from "@/app/core/http/api-client";
import { mapAdjustPricesInputToDto } from "./menus.dto";

export interface AdjustPricesMutationInput {
  menuId: string;
  percentage: number;
  sourceMode: string;
}

export async function adjustPricesMutation(input: AdjustPricesMutationInput): Promise<any> {
  const payload = mapAdjustPricesInputToDto({
    percentage: input.percentage,
    sourceMode: input.sourceMode,
  });
  const response = await apiClient.post(`/menus/${input.menuId}/adjust-prices`, payload);
  return response.data;
}
