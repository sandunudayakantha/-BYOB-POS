import { apiClient } from "@/app/core/http/api-client";
import { mapFillMissingInputToDto } from "./menus.dto";

export interface FillMissingItemsMutationInput {
  menuId: string;
  percentage: number;
  overwriteExisting: boolean;
}

export async function fillMissingItemsMutation(input: FillMissingItemsMutationInput): Promise<any> {
  const payload = mapFillMissingInputToDto({
    percentage: input.percentage,
    overwriteExisting: input.overwriteExisting,
  });
  const response = await apiClient.post(`/menus/${input.menuId}/fill-missing`, payload);
  return response.data;
}
