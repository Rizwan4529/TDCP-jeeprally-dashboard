import type { DriverRegistration } from "./registrations";

export type PaymentSource = "jeeprally";

export type CreatePaymentSessionPayload = {
  amount: number;
  orderId: string;
  returnUrl: string;
  source: PaymentSource;
  orderDescription: string;
  /** Full unpaid registration — used by central payments / booking sync. */
  booking: DriverRegistration;
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
