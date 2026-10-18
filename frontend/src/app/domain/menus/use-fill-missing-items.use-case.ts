import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fillMissingItemsMutation, type FillMissingItemsMutationInput } from "@/app/data/http/menus/fill-missing-items.mutation";

export function useFillMissingItemsUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, FillMissingItemsMutationInput>({
    mutationFn: (input: FillMissingItemsMutationInput) => fillMissingItemsMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["ownerMenus"] });
      queryClient.invalidateQueries({ queryKey: ["priceMatrix"] });
    },
  });

  return {
    fillMissingItems: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
