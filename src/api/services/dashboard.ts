import { apiClient } from "@/api/client";
import type { GetDriverDashboardResponse } from "@/api/types/dashboard";
import type { GetParticipationChartResponse } from "@/api/types/participation-chart";

export async function getDriverDashboard(): Promise<GetDriverDashboardResponse> {
  const { data } = await apiClient.get<GetDriverDashboardResponse>(
    "/dashboard/me",
  );
  return data;
}

export async function getParticipationChart(): Promise<GetParticipationChartResponse> {
  const { data } = await apiClient.get<GetParticipationChartResponse>(
    "/dashboard/me/participation-chart",
  );
  return data;
}
