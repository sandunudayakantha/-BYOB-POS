import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustPricesMutation, type AdjustPricesMutationInput } from "@/app/data/http/menus/adjust-prices.mutation";

export function useAdjustPricesUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, AdjustPricesMutationInput>({
    mutationFn: (input: AdjustPricesMutationInput) => adjustPricesMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["ownerMenus"] });
      queryClient.invalidateQueries({ queryKey: ["priceMatrix"] });
    },
  });

  return {
    adjustPrices: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
