import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBarDispenseRulesApi,
  createBarDispenseRuleApi,
  updateBarDispenseRuleApi,
  deleteBarDispenseRuleApi,
  type CreateBarDispenseRuleRequestDto,
  type UpdateBarDispenseRuleRequestDto,
} from "@/app/data/http/inventory/bar-rule.dto";
import type { BarDispenseRuleModel } from "@/app/models/bar-rule.model";

export function useBarDispenseRulesUseCase(branchId: number | string) {
  const queryClient = useQueryClient();

  const query = useQuery<BarDispenseRuleModel[]>({
    queryKey: ["barDispenseRules", branchId],
    queryFn: () => getBarDispenseRulesApi(branchId),
    enabled: Boolean(branchId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateBarDispenseRuleRequestDto) => createBarDispenseRuleApi(branchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barDispenseRules", branchId] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems", branchId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ ruleId, payload }: { ruleId: number; payload: UpdateBarDispenseRuleRequestDto }) =>
      updateBarDispenseRuleApi(ruleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barDispenseRules", branchId] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems", branchId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId: number) => deleteBarDispenseRuleApi(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barDispenseRules", branchId] });
    },
  });

  return {
    rules: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createRule: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRule: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRule: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
