import { useQuery } from "@tanstack/react-query";
import { menuItemsQuery, type MenuItemsQueryParams } from "@/app/data/http/menus/menu-items.query";
import type { MenuItemModel } from "@/app/models/menu.model";

export function useMenuItemsUseCase(params: MenuItemsQueryParams) {
  const query = useQuery<MenuItemModel[], Error>({
    queryKey: ["menuItems", params.menuId],
    queryFn: () => menuItemsQuery(params),
    enabled: Boolean(params.menuId),
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
