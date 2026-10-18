import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMenuMutation, type UpdateMenuMutationInput } from "@/app/data/http/menus/update-menu.mutation";
import type { MenuModel } from "@/app/models/menu.model";

export function useUpdateMenuUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<MenuModel, Error, UpdateMenuMutationInput>({
    mutationFn: (input: UpdateMenuMutationInput) => updateMenuMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["ownerMenus"] });
      queryClient.invalidateQueries({ queryKey: ["priceMatrix"] });
    },
  });

  return {
    updateMenu: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
