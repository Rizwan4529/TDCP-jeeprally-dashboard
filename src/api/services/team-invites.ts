import axios from "axios";

import { apiClient } from "@/api/client";
import type {
  GetMyInvitesResponse,
  RespondToInviteResponse,
} from "@/api/types/team-invites";

function toApiError(err: unknown, fallback: string): Error {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: unknown } | undefined;
    if (typeof body?.message === "string" && body.message.trim()) {
      return new Error(body.message);
    }
  }
  return err instanceof Error ? err : new Error(fallback);
}

function normalizeInvitesResponse(raw: unknown): GetMyInvitesResponse {
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response", data: [] };
  }
  const r = raw as GetMyInvitesResponse;
  return Array.isArray(r.data) ? r : { ...r, data: [] };
}

export async function getMyInvites(): Promise<GetMyInvitesResponse> {
  try {
    const { data } = await apiClient.get<unknown>("/teams/invites");
    return normalizeInvitesResponse(data);
  } catch (err) {
    throw toApiError(err, "Could not load invites.");
  }
}

export async function acceptInvite(
  inviteId: string,
): Promise<RespondToInviteResponse> {
  try {
    const { data } = await apiClient.post<RespondToInviteResponse>(
      `/teams/invites/${encodeURIComponent(inviteId)}/accept`,
    );
    return data;
  } catch (err) {
    throw toApiError(err, "Could not accept invite.");
  }
}

export async function declineInvite(
  inviteId: string,
): Promise<RespondToInviteResponse> {
  try {
    const { data } = await apiClient.post<RespondToInviteResponse>(
      `/teams/invites/${encodeURIComponent(inviteId)}/decline`,
    );
    return data;
  } catch (err) {
    throw toApiError(err, "Could not decline invite.");
  }
}
