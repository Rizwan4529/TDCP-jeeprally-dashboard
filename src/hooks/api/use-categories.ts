import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getCategories } from "@/api/services/categories";
import type { GetCategoriesResponse } from "@/api/types/categories";

export function useCategoriesQuery(enabled = true) {
  return useQuery<GetCategoriesResponse, Error>({
    queryKey: queryKeys.categories.list(),
    queryFn: getCategories,
    enabled,
    staleTime: 5 * 60_000,
  });
}
