import axios from "axios";

import { apiClient } from "@/api/client";
import type {
  CreateTeamPayload,
  DeleteTeamResponse,
  GetMyTeamsResponse,
  UpdateTeamPayload,
  UpsertTeamResponse,
} from "@/api/types/teams";

function normalizeMyTeamsResponse(raw: unknown): GetMyTeamsResponse {
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response", data: [] };
  }
  const r = raw as GetMyTeamsResponse;
  const list = r.data;
  if (!Array.isArray(list)) {
    return { ...r, data: [] };
  }
  return {
    ...r,
    data: list.map((t) => ({
      ...t,
      member_ids: Array.isArray(t.member_ids) ? t.member_ids : [],
      navigator_id: t.navigator_id ?? null,
    })),
  };
}

export async function getMyTeams(): Promise<GetMyTeamsResponse> {
  try {
    const { data } = await apiClient.get<unknown>("/teams/my-teams");
    return normalizeMyTeamsResponse(data);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return {
        success: true,
        message: "",
        data: [],
      };
    }
    throw err;
  }
}

/** @deprecated Use getMyTeams */
export const getMyTeam = getMyTeams;

export async function createTeam(
  payload: CreateTeamPayload,
): Promise<UpsertTeamResponse> {
  const { data } = await apiClient.post<UpsertTeamResponse>("/teams", payload);
  return data;
}

export async function updateTeam(
  teamId: string,
  payload: UpdateTeamPayload,
): Promise<UpsertTeamResponse> {
  const { data } = await apiClient.put<UpsertTeamResponse>(
    `/teams/${encodeURIComponent(teamId)}`,
    payload,
  );
  return data;
}

export async function deleteTeam(teamId: string): Promise<DeleteTeamResponse> {
  const { data } = await apiClient.delete<DeleteTeamResponse>(
    `/teams/${encodeURIComponent(teamId)}`,
  );
  return data;
}
