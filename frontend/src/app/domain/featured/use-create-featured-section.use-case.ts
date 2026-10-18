import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFeaturedSectionMutation,
  type CreateFeaturedSectionMutationInput,
} from "@/app/data/http/featured/create-featured-section.mutation";
import type { FeaturedSectionModel } from "@/app/models/featured.model";

export function useCreateFeaturedSectionUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<FeaturedSectionModel, Error, CreateFeaturedSectionMutationInput>({
    mutationFn: (input: CreateFeaturedSectionMutationInput) => createFeaturedSectionMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["featuredSections", variables.branchId] });
    },
  });

  return {
    createSection: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
