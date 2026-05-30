import { apiClient } from "@/api/client";
import type {
  CreateOtherRacePayload,
  DeleteOtherRaceResponse,
  GetOtherRaceResponse,
  GetOtherRacesResponse,
  UpdateOtherRacePayload,
  UpsertOtherRaceResponse,
} from "@/api/types/other-races";

function normalizeListResponse(raw: unknown): GetOtherRacesResponse {
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response", data: [] };
  }
  const r = raw as GetOtherRacesResponse;
  return Array.isArray(r.data) ? r : { ...r, data: [] };
}

export async function getOtherRaces(): Promise<GetOtherRacesResponse> {
  const { data } = await apiClient.get<unknown>("/other-races");
  return normalizeListResponse(data);
}

export async function getOtherRace(id: string): Promise<GetOtherRaceResponse> {
  const { data } = await apiClient.get<GetOtherRaceResponse>(
    `/other-races/${encodeURIComponent(id)}`,
  );
  return data;
}

export async function createOtherRace(
  payload: CreateOtherRacePayload,
): Promise<UpsertOtherRaceResponse> {
  const { data } = await apiClient.post<UpsertOtherRaceResponse>(
    "/other-races",
    payload,
  );
  return data;
}

export async function updateOtherRace(
  id: string,
  payload: UpdateOtherRacePayload,
): Promise<UpsertOtherRaceResponse> {
  const { data } = await apiClient.put<UpsertOtherRaceResponse>(
    `/other-races/${encodeURIComponent(id)}`,
    payload,
  );
  return data;
}

export async function deleteOtherRace(
  id: string,
): Promise<DeleteOtherRaceResponse> {
  const { data } = await apiClient.delete<DeleteOtherRaceResponse>(
    `/other-races/${encodeURIComponent(id)}`,
  );
  return data;
}
