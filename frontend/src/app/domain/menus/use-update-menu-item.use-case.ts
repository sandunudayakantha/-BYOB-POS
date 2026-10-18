import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMenuItemMutation, type UpdateMenuItemMutationInput } from "@/app/data/http/menus/update-menu-item.mutation";
import type { MenuItemModel } from "@/app/models/menu.model";

export function useUpdateMenuItemUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<MenuItemModel, Error, UpdateMenuItemMutationInput>({
    mutationFn: (input: UpdateMenuItemMutationInput) => updateMenuItemMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["priceMatrix"] });
    },
  });

  return {
    updateMenuItem: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
