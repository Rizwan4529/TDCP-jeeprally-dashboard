import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getActiveRally } from "@/api/services/rally";
import type { GetActiveRallyResponse } from "@/api/types/rally";

export function useActiveRallyQuery(enabled = true) {
  return useQuery<GetActiveRallyResponse, Error>({
    queryKey: queryKeys.rally.active(),
    queryFn: getActiveRally,
    enabled,
    staleTime: 60_000,
  });
}
