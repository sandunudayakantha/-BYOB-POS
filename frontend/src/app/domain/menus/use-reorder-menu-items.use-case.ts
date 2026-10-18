import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderMenuItemsMutation, type ReorderMenuItemsMutationInput } from "@/app/data/http/menus/reorder-menu-items.mutation";

export function useReorderMenuItemsUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, ReorderMenuItemsMutationInput>({
    mutationFn: (input: ReorderMenuItemsMutationInput) => reorderMenuItemsMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  return {
    reorderMenuItems: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
