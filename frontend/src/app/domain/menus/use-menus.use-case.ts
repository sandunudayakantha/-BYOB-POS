import { useQuery } from "@tanstack/react-query";
import { menusQuery, type MenusQueryParams } from "@/app/data/http/menus/menus.query";
import type { MenuModel } from "@/app/models/menu.model";

export function useMenusUseCase(params: MenusQueryParams) {
  const query = useQuery<MenuModel[], Error>({
    queryKey: ["menus", params.branchId],
    queryFn: () => menusQuery(params),
    enabled: Boolean(params.branchId),
  });

  return {
    menus: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
