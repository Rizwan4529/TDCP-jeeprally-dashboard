import { apiClient } from "@/api/client";
import type {
  ConfirmRegistrationPaymentPayload,
  CreateRegistrationPayload,
  CreateRegistrationResponse,
  GetEventRegistrationsResponse,
  GetMyRegistrationsResponse,
  GetRegistrationByIdResponse,
  SetRegistrationPaymentOrderPayload,
  UpdateRegistrationPayload,
  UpdateRegistrationResponse,
} from "@/api/types/registrations";
import { withRememberedPayment } from "@/utils/paid-overlay";

/** Lay remembered confirm-booking payment details over a single-registration response. */
function overlayOne(res: GetRegistrationByIdResponse): GetRegistrationByIdResponse {
  return res?.data ? { ...res, data: withRememberedPayment(res.data) } : res;
}

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
  return overlayOne(data);
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
  console.log(
    "registrations ✅ my-registrations response:",
    JSON.stringify(data, null, 2),
  );
  return Array.isArray(data?.data)
    ? { ...data, data: data.data.map(withRememberedPayment) }
    : data;
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

/** GET /registrations/by-order/:orderId — the driver's registration for a gateway order. */
export async function getRegistrationByOrderId(
  orderId: string,
): Promise<GetRegistrationByIdResponse> {
  const { data } = await apiClient.get<GetRegistrationByIdResponse>(
    `/registrations/by-order/${encodeURIComponent(orderId)}`,
  );
  return overlayOne(data);
}

/** PATCH /registrations/:id/payment-order — start a new payment attempt for an unpaid entry. */
export async function setRegistrationPaymentOrder(
  registrationId: string,
  payload: SetRegistrationPaymentOrderPayload,
): Promise<GetRegistrationByIdResponse> {
  const { data } = await apiClient.patch<GetRegistrationByIdResponse>(
    `/registrations/${encodeURIComponent(registrationId)}/payment-order`,
    payload,
  );
  return data;
}

/** POST /registrations/:id/confirm-payment — marks an unpaid entry as paid. Idempotent. */
export async function confirmRegistrationPayment(
  registrationId: string,
  payload: ConfirmRegistrationPaymentPayload,
): Promise<GetRegistrationByIdResponse> {
  const { data } = await apiClient.post<GetRegistrationByIdResponse>(
    `/registrations/${encodeURIComponent(registrationId)}/confirm-payment`,
    payload,
  );
  return data;
}
