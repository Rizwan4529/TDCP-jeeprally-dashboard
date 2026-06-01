import type { QueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getActiveRally } from "@/api/services/rally";
import type { GetActiveRallyResponse } from "@/api/types/rally";
import {
  clearActiveEventId,
  getRallyEventId,
  resolveActiveEventId,
  saveActiveEventId,
} from "@/utils/rally-event";

export async function fetchActiveRallyCached(): Promise<GetActiveRallyResponse> {
  const response = await getActiveRally();
  const eventId = getRallyEventId(response.data);
  if (eventId) {
    saveActiveEventId(eventId);
  } else {
    clearActiveEventId();
  }
  return response;
}

export function prefetchActiveRally(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.rally.active(),
    queryFn: fetchActiveRallyCached,
    staleTime: 5 * 60_000,
  });
}

export function useActiveRallyQuery(enabled = true) {
  return useQuery<GetActiveRallyResponse, Error>({
    queryKey: queryKeys.rally.active(),
    queryFn: fetchActiveRallyCached,
    enabled,
    staleTime: 5 * 60_000,
  });
}

/** Active rally event id from query data or localStorage cache. */
export function useActiveEventId(enabled = true): string {
  const query = useActiveRallyQuery(enabled);
  return resolveActiveEventId(query.data?.data);
}
