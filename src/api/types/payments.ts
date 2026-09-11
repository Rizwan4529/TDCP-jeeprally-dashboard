export type PaymentSource = "jeeprally";

export type CreatePaymentSessionPayload = {
  amount: number;
  orderId: string;
  returnUrl: string;
  source: PaymentSource;
  orderDescription: string;
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
