import type {
  CreateRegistrationPayload,
  DriverRegistration,
} from "./registrations";

export type PaymentSource = "jeeprally";

export type CreatePaymentSessionPayload = {
  amount: number;
  orderId: string;
  returnUrl: string;
  source: PaymentSource;
  orderDescription: string;
  /**
   * The registration being paid for — used by central payments / booking sync.
   * A new entry sends its registration details (it is created only after payment);
   * retrying an existing unpaid entry sends that saved registration.
   */
  booking: DriverRegistration | CreateRegistrationPayload;
  /**
   * The driver's Jeep Rally access token. Central payments uses it to create the
   * registration on the Jeep Rally backend after payment, from `booking`, so the
   * portal never calls POST /registrations for a paid entry.
   */
  jeepRallyToken?: string;
};

export type CreatePaymentSessionData = {
  sessionId?: string;
  paymentUrl?: string;
};

/** Central payments API envelope (status/data — differs from jeep-rally success/data). */
export type CreatePaymentSessionResponse = {
  status: string;
  data?: CreatePaymentSessionData;
  message?: string;
  success?: boolean;
};

export type ConfirmBookingOutcome =
  /** 200 — booking created; `data` is the booking. */
  | "success"
  /** 202 — payment captured, booking still being created: ask again shortly. */
  | "processing"
  /** 409 — no captured payment for this order (not paid / failed / cancelled). */
  | "not_captured"
  /** Anything else (network, 4xx/5xx). */
  | "error";

export type ConfirmBookingResult = {
  outcome: ConfirmBookingOutcome;
  httpStatus?: number;
  /** True when the backend already emailed the customer. */
  emailSent: boolean;
  /** Shape not documented — read defensively. */
  data?: unknown;
  message?: string;
};
