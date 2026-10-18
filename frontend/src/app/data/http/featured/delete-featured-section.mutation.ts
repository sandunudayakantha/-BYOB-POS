import { apiClient } from "@/app/core/http/api-client";

export interface DeleteFeaturedSectionMutationInput {
  sectionId: string;
}

export async function deleteFeaturedSectionMutation(
  input: DeleteFeaturedSectionMutationInput
): Promise<void> {
  await apiClient.delete(`/featured/${input.sectionId}`);
}
