import { apiClient } from "@/api/client";
import type {
  CreateVehiclePayload,
  DeleteVehicleResponse,
  GetMyVehiclesResponse,
  UpdateVehiclePayload,
  UploadVehicleImageResponse,
  UpsertVehicleResponse,
} from "@/api/types/vehicles";

function normalizeVehiclesResponse(raw: GetMyVehiclesResponse): GetMyVehiclesResponse {
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response", data: [] };
  }
  const list = raw.data;
  if (!Array.isArray(list)) {
    return { ...raw, data: [] };
  }
  return raw;
}

export async function getMyVehicles(): Promise<GetMyVehiclesResponse> {
  const { data } = await apiClient.get<GetMyVehiclesResponse>(
    "/vehicles/my-vehicles",
  );
  return normalizeVehiclesResponse(data);
}

/** @deprecated Use getMyVehicles */
export const getMyVehicle = getMyVehicles;

export async function createVehicle(
  payload: CreateVehiclePayload,
): Promise<UpsertVehicleResponse> {
  const { data } = await apiClient.post<UpsertVehicleResponse>(
    "/vehicles",
    payload,
  );
  return data;
}

export async function updateVehicle(
  vehicleId: string,
  payload: UpdateVehiclePayload,
): Promise<UpsertVehicleResponse> {
  const { data } = await apiClient.put<UpsertVehicleResponse>(
    `/vehicles/${encodeURIComponent(vehicleId)}`,
    payload,
  );
  return data;
}

export async function deleteVehicle(
  vehicleId: string,
): Promise<DeleteVehicleResponse> {
  const { data } = await apiClient.delete<DeleteVehicleResponse>(
    `/vehicles/${encodeURIComponent(vehicleId)}`,
  );
  return data;
}

export async function uploadVehicleImage(
  vehicleId: string,
  file: File,
): Promise<UploadVehicleImageResponse> {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.patch<UploadVehicleImageResponse>(
    `/vehicles/${encodeURIComponent(vehicleId)}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
