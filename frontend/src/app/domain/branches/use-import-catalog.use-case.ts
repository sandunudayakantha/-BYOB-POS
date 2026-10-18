import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importCatalogMutation, type ImportCatalogMutationInput } from "@/app/data/http/branches/import-catalog.mutation";

export function useImportCatalogUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, ImportCatalogMutationInput>({
    mutationFn: (input: ImportCatalogMutationInput) => importCatalogMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerBranches"] });
      queryClient.invalidateQueries({ queryKey: ["ownerCategories"] });
      queryClient.invalidateQueries({ queryKey: ["ownerProducts"] });
      queryClient.invalidateQueries({ queryKey: ["ownerMenus"] });
      queryClient.invalidateQueries({ queryKey: ["featuredSections"] });
    },
  });

  return {
    importCatalog: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
