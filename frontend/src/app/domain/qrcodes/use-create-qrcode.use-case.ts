import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createQRCodeMutation,
  type CreateQRCodeMutationInput,
} from "@/app/data/http/qrcodes/create-qrcode.mutation";
import type { QRCodeModel } from "@/app/models/qrcode.model";

export function useCreateQRCodeUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<QRCodeModel, Error, CreateQRCodeMutationInput>({
    mutationFn: (input: CreateQRCodeMutationInput) => createQRCodeMutation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ownerQRCodes", variables.branchId] });
    },
  });

  return {
    createQRCode: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
