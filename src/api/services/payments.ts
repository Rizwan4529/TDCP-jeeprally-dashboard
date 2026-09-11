import { paymentsClient } from "@/api/payments-client";
import type {
  CreatePaymentSessionPayload,
  CreatePaymentSessionResponse,
} from "@/api/types/payments";

export async function createPaymentSession(
  payload: CreatePaymentSessionPayload,
): Promise<CreatePaymentSessionResponse> {
  const { data } = await paymentsClient.post<CreatePaymentSessionResponse>(
    "/payments/create-session",
    payload,
  );
  return data;
}
