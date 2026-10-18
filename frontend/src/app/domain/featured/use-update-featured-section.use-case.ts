import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateFeaturedSectionMutation,
  type UpdateFeaturedSectionMutationInput,
} from "@/app/data/http/featured/update-featured-section.mutation";
import type { FeaturedSectionModel } from "@/app/models/featured.model";

export function useUpdateFeaturedSectionUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<FeaturedSectionModel, Error, UpdateFeaturedSectionMutationInput>({
    mutationFn: (input: UpdateFeaturedSectionMutationInput) => updateFeaturedSectionMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featuredSections"] });
    },
  });

  return {
    updateSection: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
