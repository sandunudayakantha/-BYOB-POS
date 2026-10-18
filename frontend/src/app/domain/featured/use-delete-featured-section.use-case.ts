import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteFeaturedSectionMutation,
  type DeleteFeaturedSectionMutationInput,
} from "@/app/data/http/featured/delete-featured-section.mutation";

export function useDeleteFeaturedSectionUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DeleteFeaturedSectionMutationInput>({
    mutationFn: (input: DeleteFeaturedSectionMutationInput) =>
      deleteFeaturedSectionMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featuredSections"] });
    },
  });

  return {
    deleteSection: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
