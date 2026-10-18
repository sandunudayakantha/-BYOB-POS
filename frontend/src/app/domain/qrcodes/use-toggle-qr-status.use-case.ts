import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleQrStatusMutation,
  type ToggleQRStatusMutationInput,
} from "@/app/data/http/qrcodes/toggle-qr-status.mutation";

export function useToggleQRStatusUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, ToggleQRStatusMutationInput>({
    mutationFn: (input: ToggleQRStatusMutationInput) => toggleQrStatusMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerQRCodes"] });
    },
  });

  return {
    toggleStatus: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
