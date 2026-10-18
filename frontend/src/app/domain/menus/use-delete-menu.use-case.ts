import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMenuMutation, type DeleteMenuMutationInput } from "@/app/data/http/menus/delete-menu.mutation";

export function useDeleteMenuUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DeleteMenuMutationInput>({
    mutationFn: (input: DeleteMenuMutationInput) => deleteMenuMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["ownerMenus"] });
      queryClient.invalidateQueries({ queryKey: ["priceMatrix"] });
    },
  });

  return {
    deleteMenu: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
