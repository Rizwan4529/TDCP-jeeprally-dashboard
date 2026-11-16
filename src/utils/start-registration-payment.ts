import { createPaymentSession } from "@/api/services/payments";
import { setRegistrationPaymentOrder } from "@/api/services/registrations";
import { fetchAuthToken } from "@/utils/helpers";
import type {
  CreateRegistrationPayload,
  DriverRegistration,
} from "@/api/types/registrations";
import {
  buildJeepRallyOrderDescription,
  buildPaymentReturnUrl,
  createJeepRallyOrderId,
  savePendingRegistrationPayment,
} from "@/utils/pending-registration-payment";
import {
  getRegistrationCategoryLabel,
  getRegistrationTeam,
} from "@/utils/registration-entries";

/**
 * Pay FIRST, register after: nothing is created on the Jeep Rally backend before the
 * gateway, and the portal never calls POST /registrations for it. create-session gets
 * the driver's Jeep Rally token + the registration as `booking`; central payments creates
 * the registration once the payment is confirmed and the callback page looks it up.
 */
export async function beginNewRegistrationPayment(args: {
  orderId: string;
  amount: number;
  orderDescription: string;
  payload: CreateRegistrationPayload;
}): Promise<void> {
  const { orderId, amount, orderDescription, payload } = args;

  const jeepRallyToken = fetchAuthToken();
  if (!jeepRallyToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  savePendingRegistrationPayment({
    orderId,
    amount,
    orderDescription,
    // Transaction id is added from the gateway redirect on success.
    payload,
    createdAt: Date.now(),
  });

  const session = await createPaymentSession({
    amount,
    orderId,
    returnUrl: buildPaymentReturnUrl(orderId),
    source: "jeeprally",
    orderDescription,
    jeepRallyToken,
    // Exactly the object that would have been POSTed to /registrations.
    booking: payload,
  });

  const paymentUrl = session?.data?.paymentUrl;
  if (!paymentUrl) {
    throw new Error("Payment URL not found in response");
  }

  window.location.assign(paymentUrl);
}

/**
 * Opens a gateway session for an already-saved UNPAID registration (retry from
 * "My entries" / "Pay again") and redirects the browser to it. The callback page
 * confirms the payment afterwards.
 */
export async function beginGatewayPayment(args: {
  registrationId: string;
  orderId: string;
  amount: number;
  orderDescription: string;
  booking: DriverRegistration;
}): Promise<void> {
  const { registrationId, orderId, amount, orderDescription, booking } = args;

  savePendingRegistrationPayment({
    orderId,
    registrationId,
    amount,
    orderDescription,
    createdAt: Date.now(),
  });

  const session = await createPaymentSession({
    amount,
    orderId,
    returnUrl: buildPaymentReturnUrl(orderId),
    source: "jeeprally",
    orderDescription,
    booking,
  });

  const paymentUrl = session?.data?.paymentUrl;
  if (!paymentUrl) {
    throw new Error("Payment URL not found in response");
  }

  window.location.assign(paymentUrl);
}

export function isRegistrationUnpaid(
  registration: DriverRegistration | null | undefined,
): boolean {
  return (
    registration?.payment?.status === "unpaid" &&
    registration.status !== "withdrawn" &&
    registration.status !== "rejected"
  );
}

/** Pay (again) for an unpaid registration: new order id on the backend, then the gateway. */
export async function retryRegistrationPayment(
  registration: DriverRegistration,
): Promise<void> {
  const amount = Number(registration.payment?.amount);
  if (!isRegistrationUnpaid(registration) || !(amount > 0)) {
    throw new Error("This entry does not need a payment.");
  }

  const orderId = createJeepRallyOrderId();
  await setRegistrationPaymentOrder(registration._id, { order_id: orderId });

  const event =
    typeof registration.event_id === "object" ? registration.event_id : null;
  const orderDescription = buildJeepRallyOrderDescription([
    getRegistrationCategoryLabel(registration),
    registration.payment?.entry_mode === "sponsor" ? "Sponsor" : "Individual",
    getRegistrationTeam(registration)?.team_name,
    event?.name,
  ]);

  const booking: DriverRegistration = {
    ...registration,
    payment: registration.payment
      ? { ...registration.payment, order_id: orderId, status: "unpaid" }
      : {
          status: "unpaid",
          amount,
          order_id: orderId,
        },
  };

  await beginGatewayPayment({
    registrationId: registration._id,
    orderId,
    amount,
    orderDescription,
    booking,
  });
}
