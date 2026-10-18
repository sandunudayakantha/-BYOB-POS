import { useMutation } from "@tanstack/react-query";
import {
  resetRestaurantPasswordMutation,
  type ResetRestaurantPasswordMutationInput,
} from "@/app/data/http/restaurants/reset-restaurant-password.mutation";

export function useResetRestaurantPasswordUseCase() {
  const mutation = useMutation<any, Error, ResetRestaurantPasswordMutationInput>({
    mutationFn: (input: ResetRestaurantPasswordMutationInput) =>
      resetRestaurantPasswordMutation(input),
  });

  return {
    resetPassword: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
