import { apiClient } from "@/api/client";
import type {
  CreateRegistrationPayload,
  CreateRegistrationResponse,
} from "@/api/types/registrations";

export async function createRegistration(
  payload: CreateRegistrationPayload,
): Promise<CreateRegistrationResponse> {
  const { data } = await apiClient.post<CreateRegistrationResponse>(
    "/registrations",
    payload,
  );
  return data;
}

