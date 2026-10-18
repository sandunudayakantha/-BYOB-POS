import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMenuItemMutation, type RemoveMenuItemMutationInput } from "@/app/data/http/menus/remove-menu-item.mutation";

export function useRemoveMenuItemUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, RemoveMenuItemMutationInput>({
    mutationFn: (input: RemoveMenuItemMutationInput) => removeMenuItemMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["priceMatrix"] });
    },
  });

  return {
    removeMenuItem: mutation.mutateAsync,
    isRemoving: mutation.isPending,
    error: mutation.error,
  };
}
