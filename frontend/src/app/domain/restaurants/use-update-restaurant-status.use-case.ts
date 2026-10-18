import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateRestaurantStatusMutation,
  type UpdateRestaurantStatusMutationInput,
} from "@/app/data/http/restaurants/update-restaurant-status.mutation";

export function useUpdateRestaurantStatusUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, UpdateRestaurantStatusMutationInput>({
    mutationFn: (input: UpdateRestaurantStatusMutationInput) =>
      updateRestaurantStatusMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRestaurants"] });
    },
  });

  return {
    updateStatus: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
