import { apiClient } from "@/app/core/http/api-client";
import { mapCustomerMenuDtoToModel, type CustomerMenuDto } from "./customer-menu.dto";
import type { CustomerMenuResponseModel } from "@/app/models/customer-menu.model";

export interface CustomerMenuQueryParams {
  token: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

export async function customerMenuQuery(params: CustomerMenuQueryParams): Promise<CustomerMenuResponseModel> {
  const { token, page = 1, limit = 10, categoryId, search } = params;
  const response = await apiClient.get<any>(`/public/menu/${token}`, {
    params: {
      page,
      limit,
      categoryId,
      search,
    },
  });

  const payload: CustomerMenuDto = response.data?.data || response.data;
  return mapCustomerMenuDtoToModel(payload);
}
