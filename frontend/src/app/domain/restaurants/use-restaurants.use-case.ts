import { useQuery } from "@tanstack/react-query";
import { restaurantsQuery } from "@/app/data/http/restaurants/restaurants.query";
import type { RestaurantModel } from "@/app/models/restaurant.model";

export function useRestaurantsUseCase() {
  const query = useQuery<RestaurantModel[], Error>({
    queryKey: ["adminRestaurants"],
    queryFn: () => restaurantsQuery(),
  });

  return {
    restaurants: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
