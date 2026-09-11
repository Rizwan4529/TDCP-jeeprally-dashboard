import type { QueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getRallyPricing } from "@/api/services/rally";
import type { GetRallyPricingResponse } from "@/api/types/rally";

export function prefetchRallyPricing(
  queryClient: QueryClient,
  eventId: string,
) {
  if (!eventId) return Promise.resolve();
  return queryClient.prefetchQuery({
    queryKey: queryKeys.rally.pricing(eventId),
    queryFn: () => getRallyPricing(eventId),
    staleTime: 5 * 60_000,
  });
}

export function useRallyPricingQuery(eventId: string, enabled = true) {
  return useQuery<GetRallyPricingResponse, Error>({
    queryKey: queryKeys.rally.pricing(eventId),
    queryFn: () => getRallyPricing(eventId),
    enabled: Boolean(eventId) && enabled,
    staleTime: 5 * 60_000,
  });
}
