import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRestaurantMutation,
  type CreateRestaurantMutationInput,
} from "@/app/data/http/restaurants/create-restaurant.mutation";
import type { RestaurantModel } from "@/app/models/restaurant.model";

export function useCreateRestaurantUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<RestaurantModel, Error, CreateRestaurantMutationInput>({
    mutationFn: (input: CreateRestaurantMutationInput) => createRestaurantMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRestaurants"] });
    },
  });

  return {
    createRestaurant: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
