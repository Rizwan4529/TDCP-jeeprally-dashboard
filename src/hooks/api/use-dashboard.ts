import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getDriverDashboard } from "@/api/services/dashboard";
import type { GetDriverDashboardResponse } from "@/api/types/dashboard";

export function useDriverDashboardQuery(enabled: boolean) {
  return useQuery<GetDriverDashboardResponse, Error>({
    queryKey: queryKeys.dashboard.me(),
    queryFn: getDriverDashboard,
    enabled,
    staleTime: 30_000,
  });
}
