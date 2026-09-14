import { apiClient } from "@/api/client";
import type {
  CreateRegistrationPayload,
  CreateRegistrationResponse,
  GetEventRegistrationsResponse,
  GetMyRegistrationsResponse,
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
  const { data } = await apiClient.patch<UpdateRegistrationResponse>(
    `/registrations/${encodeURIComponent(registrationId)}`,
    payload,
  );
  return data;
}

/** GET /registrations/my-registrations — all of the driver's registrations. */
export async function getMyRegistrations(): Promise<GetMyRegistrationsResponse> {
  const { data } = await apiClient.get<GetMyRegistrationsResponse>(
    "/registrations/my-registrations",
  );
  return data;
}

/** @deprecated Prefer getMyRegistrations + client-side event filter. */
export async function getEventRegistrations(
  eventId: string,
): Promise<GetEventRegistrationsResponse> {
  const { data } = await apiClient.get<GetEventRegistrationsResponse>(
    `/rally/${encodeURIComponent(eventId)}/registrations`,
  );
  return data;
}
