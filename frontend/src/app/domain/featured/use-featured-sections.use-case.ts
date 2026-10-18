import { useQuery } from "@tanstack/react-query";
import {
  featuredSectionsQuery,
  type FeaturedSectionsQueryParams,
} from "@/app/data/http/featured/featured-sections.query";
import type { FeaturedSectionModel } from "@/app/models/featured.model";

export function useFeaturedSectionsUseCase(params: FeaturedSectionsQueryParams) {
  const query = useQuery<FeaturedSectionModel[], Error>({
    queryKey: ["featuredSections", params.branchId],
    queryFn: () => featuredSectionsQuery(params),
    enabled: Boolean(params.branchId),
  });

  return {
    sections: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
