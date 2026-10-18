import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteQrCodeMutation,
  type DeleteQRCodeMutationInput,
} from "@/app/data/http/qrcodes/delete-qrcode.mutation";

export function useDeleteQRCodeUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, DeleteQRCodeMutationInput>({
    mutationFn: (input: DeleteQRCodeMutationInput) => deleteQrCodeMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerQRCodes"] });
    },
  });

  return {
    deleteQRCode: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
