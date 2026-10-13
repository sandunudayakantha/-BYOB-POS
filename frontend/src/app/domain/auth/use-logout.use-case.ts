import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutMutation } from "@/app/data/http/auth/logout.mutation";

export function useLogoutUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, void>({
    mutationFn: () => logoutMutation(),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    logout: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}
