import { apiClient } from "@/app/core/http/api-client";
import { mapPlatformStatsDtoToModel, type PlatformStatsDto } from "./restaurants.dto";
import type { PlatformStatsModel } from "@/app/models/restaurant.model";

export async function platformStatsQuery(): Promise<PlatformStatsModel> {
  const response = await apiClient.get<PlatformStatsDto>("/admin/dashboard-stats");
  return mapPlatformStatsDtoToModel(response.data);
}
