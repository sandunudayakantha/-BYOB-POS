import { apiClient } from "@/app/core/http/api-client";

export interface DeleteBranchMutationInput {
  branchId: string;
}

export async function deleteBranchMutation(input: DeleteBranchMutationInput): Promise<void> {
  await apiClient.delete(`/branches/${input.branchId}`);
}
