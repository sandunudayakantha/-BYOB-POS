import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setBaseMenuMutation, type SetBaseMenuMutationInput } from "@/app/data/http/menus/set-base-menu.mutation";

export function useSetBaseMenuUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, SetBaseMenuMutationInput>({
    mutationFn: (input: SetBaseMenuMutationInput) => setBaseMenuMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["ownerMenus"] });
      queryClient.invalidateQueries({ queryKey: ["priceMatrix"] });
    },
  });

  return {
    setBaseMenu: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
