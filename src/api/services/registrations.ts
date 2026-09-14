import { apiClient } from "@/api/client";
import type {
  CreateRegistrationPayload,
  CreateRegistrationResponse,
  GetEventRegistrationsResponse,
  GetRegistrationByIdResponse,
  UpdateRegistrationPayload,
  UpdateRegistrationResponse,
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

export async function getRegistrationById(
  registrationId: string,
): Promise<GetRegistrationByIdResponse> {
  const { data } = await apiClient.get<GetRegistrationByIdResponse>(
    `/registrations/${encodeURIComponent(registrationId)}`,
  );
  return data;
}

export async function updateRegistration(
  registrationId: string,
  payload: UpdateRegistrationPayload,
): Promise<UpdateRegistrationResponse> {
  const { data } = await apiClient.put<UpdateRegistrationResponse>(
    `/registrations/${encodeURIComponent(registrationId)}`,
    payload,
  );
  return data;
}

/** GET /rally/:eventId/registrations — own entries for the active rally. */
export async function getEventRegistrations(
  eventId: string,
): Promise<GetEventRegistrationsResponse> {
  const { data } = await apiClient.get<GetEventRegistrationsResponse>(
    `/rally/${encodeURIComponent(eventId)}/registrations`,
  );
  return data;
}
