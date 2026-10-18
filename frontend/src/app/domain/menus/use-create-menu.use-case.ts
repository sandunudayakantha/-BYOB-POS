import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMenuMutation, type CreateMenuMutationInput } from "@/app/data/http/menus/create-menu.mutation";
import type { MenuModel } from "@/app/models/menu.model";

export function useCreateMenuUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<MenuModel, Error, CreateMenuMutationInput>({
    mutationFn: (input: CreateMenuMutationInput) => createMenuMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menus", variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ["ownerMenus", variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ["priceMatrix"] });
    },
  });

  return {
    createMenu: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
