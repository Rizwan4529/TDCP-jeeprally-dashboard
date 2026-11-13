import { createPaymentSession } from "@/api/services/payments";
import { setRegistrationPaymentOrder } from "@/api/services/registrations";
import type { DriverRegistration } from "@/api/types/registrations";
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
 * Opens a gateway session for an already-created (unpaid) registration and
 * redirects the browser to it. The success page confirms the payment afterwards.
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
