import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import type { GetRallyEventsQuery, GetRallyEventsResponse } from "@/api/types/rally";
import { getRallyEvents } from "@/api/services/rally";

type RallyEventsQueryOptions = {
  enabled?: boolean;
};

export function useRallyEventsQuery(
  query: GetRallyEventsQuery,
  options?: RallyEventsQueryOptions,
) {
  return useQuery<GetRallyEventsResponse, Error>({
    queryKey: queryKeys.rally.events(query),
    queryFn: () => getRallyEvents(query),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

