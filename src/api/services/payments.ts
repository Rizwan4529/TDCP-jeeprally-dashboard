import { paymentsClient } from "@/api/payments-client";
import type {
  ConfirmBookingResult,
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

/**
 * POST /payments/confirm-booking — after a successful gateway redirect, asks central to
 * verify the captured payment and create the booking (the Jeep Rally registration).
 * 200 success | 202 processing | 409 "Captured payment was not found for this order".
 */
export async function confirmBooking(args: {
  orderId: string;
  source: "jeeprally";
}): Promise<ConfirmBookingResult> {
  try {
    const res = await paymentsClient.post(
      "/payments/confirm-booking",
      { orderId: args.orderId, source: args.source },
      // Handle 202 / 409 here instead of letting axios throw on them.
      { validateStatus: (status) => status >= 200 && status < 500 },
    );
    const body = (res.data ?? {}) as {
      status?: string;
      emailSent?: boolean;
      data?: unknown;
      message?: string;
    };
    console.log("payments confirm-booking", res.status, body);

    if (res.status === 200 && body.status !== "error") {
      return {
        outcome: "success",
        httpStatus: 200,
        emailSent: body.emailSent === true,
        data: body.data,
        message: body.message,
      };
    }
    if (res.status === 202) {
      return { outcome: "processing", httpStatus: 202, emailSent: false };
    }
    if (res.status === 409) {
      return {
        outcome: "not_captured",
        httpStatus: 409,
        emailSent: false,
        message: body.message,
      };
    }
    return {
      outcome: "error",
      httpStatus: res.status,
      emailSent: false,
      message: body.message || `Could not confirm booking (${res.status})`,
    };
  } catch (error) {
    return {
      outcome: "error",
      emailSent: false,
      message: error instanceof Error ? error.message : "Could not confirm booking",
    };
  }
}
