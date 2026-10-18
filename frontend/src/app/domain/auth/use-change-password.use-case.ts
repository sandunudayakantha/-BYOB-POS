import { useMutation } from "@tanstack/react-query";
import {
  changePasswordMutation,
  type ChangePasswordMutationInput,
} from "@/app/data/http/auth/change-password.mutation";

export function useChangePasswordUseCase() {
  const mutation = useMutation<any, Error, ChangePasswordMutationInput>({
    mutationFn: (input: ChangePasswordMutationInput) => changePasswordMutation(input),
  });

  return {
    changePassword: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
