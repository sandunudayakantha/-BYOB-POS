import { apiClient } from "@/app/core/http/api-client";
import {
  mapUpdateFeaturedInputToDto,
  mapFeaturedSectionDtoToModel,
  type FeaturedSectionDto,
} from "./featured.dto";
import type { FeaturedSectionModel } from "@/app/models/featured.model";

export interface UpdateFeaturedSectionMutationInput {
  sectionId: string;
  title?: string;
  description?: string;
  products?: (number | string)[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export async function updateFeaturedSectionMutation(
  input: UpdateFeaturedSectionMutationInput
): Promise<FeaturedSectionModel> {
  const payload = mapUpdateFeaturedInputToDto({
    title: input.title,
    description: input.description,
    products: input.products,
    startDate: input.startDate,
    endDate: input.endDate,
    isActive: input.isActive,
  });
  const response = await apiClient.put<FeaturedSectionDto | { data: FeaturedSectionDto }>(
    `/featured/${input.sectionId}`,
    payload
  );
  const data = (response.data as any)?.data || response.data;
  return mapFeaturedSectionDtoToModel(data);
}
