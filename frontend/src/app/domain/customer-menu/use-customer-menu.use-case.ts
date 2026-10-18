import { useQuery } from "@tanstack/react-query";
import { customerMenuQuery, type CustomerMenuQueryParams } from "@/app/data/http/customer-menu/customer-menu.query";
import type { CustomerMenuResponseModel } from "@/app/models/customer-menu.model";

export function useCustomerMenu(params: CustomerMenuQueryParams) {
  return useQuery<CustomerMenuResponseModel, Error>({
    queryKey: ["customer-menu", params.token, params.page, params.categoryId, params.search],
    queryFn: () => customerMenuQuery(params),
    enabled: Boolean(params.token),
    staleTime: 60 * 1000,
  });
}
