import { apiClient } from "@/app/core/http/api-client";
import { mapFeaturedSectionDtoToModel, type FeaturedSectionDto } from "./featured.dto";
import type { FeaturedSectionModel } from "@/app/models/featured.model";

export interface FeaturedSectionsQueryParams {
  branchId: string;
}

export async function featuredSectionsQuery(params: FeaturedSectionsQueryParams): Promise<FeaturedSectionModel[]> {
  const response = await apiClient.get<FeaturedSectionDto[] | { data: FeaturedSectionDto[] }>("/featured", {
    params: {
      branchId: params.branchId,
    },
  });

  const rawList = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
  return rawList.map(mapFeaturedSectionDtoToModel);
}
