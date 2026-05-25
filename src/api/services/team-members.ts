import { apiClient } from "@/api/client";
import type {
  CreateTeamMemberPayload,
  DeleteTeamMemberResponse,
  GetTeamMemberResponse,
  GetTeamMembersResponse,
  UpdateTeamMemberPayload,
  UpsertTeamMemberResponse,
} from "@/api/types/team-members";

const multipartHeaders = { "Content-Type": "multipart/form-data" } as const;

function normalizeListResponse(raw: unknown): GetTeamMembersResponse {
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response", data: [] };
  }
  const r = raw as GetTeamMembersResponse;
  return Array.isArray(r.data) ? r : { ...r, data: [] };
}

function appendTeamMemberFields(
  formData: FormData,
  payload: CreateTeamMemberPayload | UpdateTeamMemberPayload,
) {
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  }
}

function hasFile(
  payload: CreateTeamMemberPayload | UpdateTeamMemberPayload,
): boolean {
  return payload.profile_image instanceof File;
}

export async function getTeamMembers(): Promise<GetTeamMembersResponse> {
  const { data } = await apiClient.get<unknown>("/team-members");
  return normalizeListResponse(data);
}

export async function getTeamMember(
  memberId: string,
): Promise<GetTeamMemberResponse> {
  const { data } = await apiClient.get<GetTeamMemberResponse>(
    `/team-members/${encodeURIComponent(memberId)}`,
  );
  return data;
}

export async function createTeamMember(
  payload: CreateTeamMemberPayload,
): Promise<UpsertTeamMemberResponse> {
  if (hasFile(payload)) {
    const formData = new FormData();
    appendTeamMemberFields(formData, payload);
    const { data } = await apiClient.post<UpsertTeamMemberResponse>(
      "/team-members",
      formData,
      { headers: { ...multipartHeaders } },
    );
    return data;
  }
  const { profile_image: _img, ...json } = payload;
  const { data } = await apiClient.post<UpsertTeamMemberResponse>(
    "/team-members",
    json,
  );
  return data;
}

export async function updateTeamMember(
  memberId: string,
  payload: UpdateTeamMemberPayload,
): Promise<UpsertTeamMemberResponse> {
  if (hasFile(payload)) {
    const formData = new FormData();
    appendTeamMemberFields(formData, payload);
    const { data } = await apiClient.put<UpsertTeamMemberResponse>(
      `/team-members/${encodeURIComponent(memberId)}`,
      formData,
      { headers: { ...multipartHeaders } },
    );
    return data;
  }
  const { profile_image: _img, ...json } = payload;
  const { data } = await apiClient.put<UpsertTeamMemberResponse>(
    `/team-members/${encodeURIComponent(memberId)}`,
    json,
  );
  return data;
}

export async function deleteTeamMember(
  memberId: string,
): Promise<DeleteTeamMemberResponse> {
  const { data } = await apiClient.delete<DeleteTeamMemberResponse>(
    `/team-members/${encodeURIComponent(memberId)}`,
  );
  return data;
}
