import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getParticipationChart } from "@/api/services/dashboard";
import type { GetParticipationChartResponse } from "@/api/types/participation-chart";

export function useParticipationChartQuery(enabled: boolean) {
  return useQuery<GetParticipationChartResponse, Error>({
    queryKey: queryKeys.dashboard.participationChart(),
    queryFn: getParticipationChart,
    enabled,
    staleTime: 30_000,
  });
}
