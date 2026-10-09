import axios from "axios";

import { apiClient } from "@/api/client";
import type {
  CreateTeamPayload,
  DeleteTeamResponse,
  GetMyTeamsResponse,
  InviteCoDriverPayload,
  InviteCoDriverResponse,
  UpdateTeamPayload,
  UpsertTeamResponse,
} from "@/api/types/teams";

/** Surfaces the backend `message` (e.g. "Driver account not found…") instead of axios' generic text. */
function toApiError(err: unknown, fallback: string): Error {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: unknown } | undefined;
    if (typeof body?.message === "string" && body.message.trim()) {
      return new Error(body.message);
    }
  }
  return err instanceof Error ? err : new Error(fallback);
}

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
  try {
    const { data } = await apiClient.post<UpsertTeamResponse>("/teams", payload);
    return data;
  } catch (err) {
    throw toApiError(err, "Could not create team.");
  }
}

export async function updateTeam(
  teamId: string,
  payload: UpdateTeamPayload,
): Promise<UpsertTeamResponse> {
  try {
    const { data } = await apiClient.put<UpsertTeamResponse>(
      `/teams/${encodeURIComponent(teamId)}`,
      payload,
    );
    return data;
  } catch (err) {
    throw toApiError(err, "Could not update team.");
  }
}

export async function inviteCoDriver(
  teamId: string,
  payload: InviteCoDriverPayload,
): Promise<InviteCoDriverResponse> {
  try {
    const { data } = await apiClient.post<InviteCoDriverResponse>(
      `/teams/${encodeURIComponent(teamId)}/invites`,
      payload,
    );
    return data;
  } catch (err) {
    throw toApiError(err, "Could not send invite.");
  }
}

export async function deleteTeam(teamId: string): Promise<DeleteTeamResponse> {
  const { data } = await apiClient.delete<DeleteTeamResponse>(
    `/teams/${encodeURIComponent(teamId)}`,
  );
  return data;
}
