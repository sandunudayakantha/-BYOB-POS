import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginMutation, type LoginMutationInput } from "@/app/data/http/auth/login.mutation";
import type { AuthTokensModel } from "@/app/models/user.model";

export function useLoginUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<AuthTokensModel, Error, LoginMutationInput>({
    mutationFn: (input: LoginMutationInput) => loginMutation(input),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    login: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
