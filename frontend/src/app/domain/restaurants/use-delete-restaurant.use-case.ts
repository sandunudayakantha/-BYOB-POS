import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteRestaurantMutation,
  type DeleteRestaurantMutationInput,
} from "@/app/data/http/restaurants/delete-restaurant.mutation";

export function useDeleteRestaurantUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DeleteRestaurantMutationInput>({
    mutationFn: (input: DeleteRestaurantMutationInput) => deleteRestaurantMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRestaurants"] });
    },
  });

  return {
    deleteRestaurant: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
