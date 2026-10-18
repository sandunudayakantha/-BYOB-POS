import { apiClient } from "@/app/core/http/api-client";
import { mapImportCatalogInputToDto } from "./branches.dto";

export interface ImportCatalogMutationInput {
  sourceBranchId: string;
  targetBranchId: string;
  includeCategoriesAndProducts: boolean;
  includeMenus: boolean;
  includeFeatured: boolean;
}

export async function importCatalogMutation(input: ImportCatalogMutationInput): Promise<any> {
  const payload = mapImportCatalogInputToDto(input);
  const response = await apiClient.post("/branches/import", payload);
  return response.data;
}
