import { useQuery } from "@tanstack/react-query";
import { platformStatsQuery } from "@/app/data/http/restaurants/platform-stats.query";
import type { PlatformStatsModel } from "@/app/models/restaurant.model";

export function usePlatformStats() {
  return useQuery<PlatformStatsModel>({
    queryKey: ["platform-stats"],
    queryFn: () => platformStatsQuery(),
  });
}
