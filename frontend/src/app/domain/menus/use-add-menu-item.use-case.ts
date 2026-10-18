import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMenuItemMutation, type AddMenuItemMutationInput } from "@/app/data/http/menus/add-menu-item.mutation";
import type { MenuItemModel } from "@/app/models/menu.model";

export function useAddMenuItemUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<MenuItemModel, Error, AddMenuItemMutationInput>({
    mutationFn: (input: AddMenuItemMutationInput) => addMenuItemMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", variables.menuId] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["priceMatrix"] });
    },
  });

  return {
    addMenuItem: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
