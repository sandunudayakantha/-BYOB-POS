import { apiClient } from "@/app/core/http/api-client";
import {
  mapCreateFeaturedInputToDto,
  mapFeaturedSectionDtoToModel,
  type FeaturedSectionDto,
} from "./featured.dto";
import type { FeaturedSectionModel } from "@/app/models/featured.model";

export interface CreateFeaturedSectionMutationInput {
  branchId: string;
  title: string;
  description?: string;
  products: (number | string)[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export async function createFeaturedSectionMutation(
  input: CreateFeaturedSectionMutationInput
): Promise<FeaturedSectionModel> {
  const payload = mapCreateFeaturedInputToDto(input);
  const response = await apiClient.post<FeaturedSectionDto | { data: FeaturedSectionDto }>("/featured", payload);
  const data = (response.data as any)?.data || response.data;
  return mapFeaturedSectionDtoToModel(data);
}
