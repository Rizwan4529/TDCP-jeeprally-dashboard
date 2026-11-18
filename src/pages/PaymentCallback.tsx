import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  RotateCcwIcon,
  XCircleIcon,
} from "lucide-react";

import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/api/query-keys";
import { confirmBooking } from "@/api/services/payments";
import {
  confirmRegistrationPayment,
  getRegistrationByOrderId,
} from "@/api/services/registrations";
import type { DriverRegistration } from "@/api/types/registrations";
import { registrationSuccessPath, ROUTES } from "@/utils/constants";
import {
  isRegistrationUnpaid,
  retryRegistrationPayment,
} from "@/utils/start-registration-payment";
import {
  parsePaymentCallbackParams,
  resolvePaymentCallbackOutcome,
} from "@/utils/payment-callback";
import {
  clearPendingRegistrationPayment,
  loadPendingRegistrationPayment,
} from "@/utils/pending-registration-payment";
import { formatRallyAmount } from "@/utils/rally-pricing";
import { rememberPaidFromConfirm } from "@/utils/paid-overlay";

/** Backend webhook can take a while after payment: poll confirm-booking every 5s for up to 2 minutes. */
const CONFIRM_POLL_MS = 5000;
const CONFIRM_WINDOW_MS = 120000;

/** Status hints shown while waiting for the webhook. */
const PROCESSING_STEPS = [
  "Payment received",
  "Verifying with your bank",
  "Creating your registration",
  "Sending your confirmation",
];

type CallbackState =
  | { kind: "thanks"; message: string }
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string }
  | { kind: "failure"; message: string }
  | { kind: "error"; message: string };

/** Order details kept for the result screen after the pending record is cleared. */
type OrderSummary = {
  orderId: string;
  amount: number;
  description: string;
  gatewayStatus?: string;
  transactionId?: string;
};

/**
 * confirm-booking's `data` shape isn't documented, so look for a registration (an object
 * with an `_id`/`id`) at the usual spots instead of assuming one.
 */
function pickRegistration(data: unknown): DriverRegistration | null {
  const asRecord = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : null;
  const root = asRecord(data);
  if (!root) return null;
  // Real shape (seen 2026-11-16): `data` is the central booking document and the Jeep Rally
  // registration itself is `data.metaInfo` (its `_id` === `data.id`). Prefer it over `data`,
  // whose own status/payment fields describe the central booking, not the registration.
  const candidates = [
    asRecord(root.metaInfo),
    asRecord(root.registration),
    asRecord(root.booking),
    asRecord(root.data),
    asRecord(root.result),
    root,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const id =
      typeof c._id === "string" ? c._id : typeof c.id === "string" ? c.id : "";
    if (id) return { ...(c as object), _id: id } as DriverRegistration;
  }
  return null;
}

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data;
    if (typeof body === "object" && body !== null) {
      const record = body as Record<string, unknown>;
      if (typeof record.message === "string") return record.message;
    }
    return error.message || "Request failed";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/** Order id from our own return URL (?orderId=JEEPRALLY-...), or the gateway's echo of it. */
function resolveOrderId(href: string, pendingOrderId?: string): string {
  const parsed = parsePaymentCallbackParams(href);
  return (
    pendingOrderId ||
    parsed.orderIds.find((id) => /^jeeprally[-_]/i.test(id.trim())) ||
    parsed.orderIds[0] ||
    ""
  );
}

export default function PaymentCallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handledRef = useRef(false);
  const [state, setState] = useState<CallbackState>({
    kind: "loading",
    message: "Confirming your payment…",
  });
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [registration, setRegistration] = useState<DriverRegistration | null>(
    null,
  );
  const [retrying, setRetrying] = useState(false);
  /** Set when we start waiting for the backend webhook; drives the steps + progress bar. */
  const [confirmStartedAt, setConfirmStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (confirmStartedAt == null || state.kind !== "loading") return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [confirmStartedAt, state.kind]);

  const confirmProgress =
    confirmStartedAt == null
      ? 0
      : Math.min(1, Math.max(0, (now - confirmStartedAt) / CONFIRM_WINDOW_MS));
  const activeStep = Math.min(
    PROCESSING_STEPS.length - 1,
    Math.floor(confirmProgress * PROCESSING_STEPS.length),
  );

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const run = async () => {
      const pending = loadPendingRegistrationPayment();
      const href = window.location.href;
      const orderId = resolveOrderId(href, undefined);

      if (!orderId && !pending) {
        setState({
          kind: "error",
          message:
            "No payment order was found in this link. Check My entries for your registration status.",
        });
        return;
      }

      // New entry (pay first): nothing exists on the backend yet. Create the
      // registration only once the gateway confirms the payment.
      if (pending?.payload) {
        const parsedNew = parsePaymentCallbackParams(href);
        const newSummary: OrderSummary = {
          orderId: pending.orderId,
          amount: pending.amount,
          description: pending.orderDescription,
          gatewayStatus: parsedNew.status,
          transactionId: parsedNew.transactionId,
        };
        setOrder(newSummary);

        const newOutcome = resolvePaymentCallbackOutcome(href, pending.orderId);
        const newLooksFailed =
          newOutcome === "unknown" &&
          /fail|cancel|declined/.test(href.toLowerCase());

        if (newOutcome === "failure" || newLooksFailed) {
          clearPendingRegistrationPayment();
          toast.error("Payment failed", {
            description: "Payment failed or was cancelled.",
          });
          setState({
            kind: "failure",
            message:
              "Your payment didn't go through or was cancelled, so your registration was not submitted. You can try again from registration.",
          });
          return;
        }

        if (newOutcome === "unknown") {
          setState({
            kind: "error",
            message:
              "We could not confirm the payment status from the gateway response. If you were charged, contact support with your order ID, or return to registration to try again.",
          });
          return;
        }

        const startedAt = Date.now();
        setConfirmStartedAt(startedAt);
        setState({
          kind: "loading",
          message:
            "Please keep this page open while we confirm your registration. This can take up to a couple of minutes.",
        });

        // The portal does NOT call POST /registrations. Central payments creates the
        // registration on the Jeep Rally backend (it was given the driver's token +
        // booking in create-session); we only ask it to confirm: confirm-booking.
        // The backend webhook can take up to a couple of minutes, and the gateway redirects us before it's done,
        // so 409 / 202 / a transient error right after paying just mean "not ready yet":
        // ask again every 5s for up to 2 minutes and stop at the first 200.
        let confirmed = await confirmBooking({
          orderId: pending.orderId,
          source: "jeeprally",
        });
        while (
          confirmed.outcome !== "success" &&
          Date.now() - startedAt < CONFIRM_WINDOW_MS
        ) {
          await new Promise((r) => setTimeout(r, CONFIRM_POLL_MS));
          confirmed = await confirmBooking({
            orderId: pending.orderId,
            source: "jeeprally",
          });
        }

        // confirm-booking's `data` shape isn't documented: find a registration id in it,
        // else fall back to a (read-only) lookup by order id for the success screen.
        let createdRegistration: DriverRegistration | null = null;
        if (confirmed.outcome === "success") {
          createdRegistration = pickRegistration(confirmed.data);
          if (!createdRegistration) {
            try {
              const res = await getRegistrationByOrderId(pending.orderId);
              createdRegistration = res.data ?? null;
            } catch {
              /* the booking exists; only the receipt link is missing */
            }
          }
        }
        if (confirmed.outcome === "success" && !createdRegistration) {
          // Booking confirmed but no id to deep-link: show the list.
          clearPendingRegistrationPayment();
          await queryClient.invalidateQueries({
            queryKey: queryKeys.registrations.all,
          });
          toast.success("Registration submitted", {
            description: "Your Jeep Rally entry has been received.",
          });
          navigate(ROUTES.MY_REGISTRATIONS, { replace: true });
          return;
        }

        if (createdRegistration) {
          // Keep the captured-payment details (transaction id, paid time) for the receipt.
          rememberPaidFromConfirm(createdRegistration._id, confirmed.data);
          clearPendingRegistrationPayment();
          await queryClient.invalidateQueries({
            queryKey: queryKeys.registrations.all,
          });
          toast.success("Registration submitted", {
            description: "Your Jeep Rally entry has been received.",
          });
          setState({
            kind: "success",
            message: "Payment successful. Your registration has been submitted.",
          });
          navigate(registrationSuccessPath(createdRegistration._id), {
            replace: true,
          });
          return;
        }

        // No 200 within the window. The payment WAS taken, so never ask them to pay
        // again: thank them — the backend finishes the booking and emails them.
        clearPendingRegistrationPayment();
        await queryClient.invalidateQueries({
          queryKey: queryKeys.registrations.all,
        });
        setState({
          kind: "thanks",
          message:
            "We've received your payment. Your registration is taking a little longer than usual to confirm — we'll finish it for you shortly and email you once it's done. You don't need to pay again.",
        });
        return;
      }

      // Retry of an existing unpaid entry: look it up by order id.
      let found: DriverRegistration | null;
      try {
        const res = await getRegistrationByOrderId(orderId || pending!.orderId);
        found = res.data ?? null;
      } catch (err) {
        setState({
          kind: "error",
          message:
            getApiErrorMessage(err) +
            " If you were charged, contact support with your order ID.",
        });
        return;
      }
      if (!found) {
        setState({
          kind: "error",
          message: "We could not find a registration for this payment.",
        });
        return;
      }
      setRegistration(found);

      const effectiveOrderId = found.payment?.order_id || orderId;
      const parsed = parsePaymentCallbackParams(href);
      const summary: OrderSummary = {
        orderId: effectiveOrderId,
        amount: Number(found.payment?.amount ?? pending?.amount ?? 0),
        description: pending?.orderDescription ?? "Jeep Rally registration",
        gatewayStatus: parsed.status,
        transactionId: parsed.transactionId,
      };
      setOrder(summary);

      // Already paid (page reload / double visit): nothing more to do.
      if (found.payment?.status === "paid") {
        clearPendingRegistrationPayment();
        navigate(registrationSuccessPath(found._id), { replace: true });
        return;
      }

      const outcome = resolvePaymentCallbackOutcome(href, effectiveOrderId);
      const looksFailed =
        outcome === "unknown" && /fail|cancel|declined/.test(href.toLowerCase());

      if (outcome === "failure" || looksFailed) {
        clearPendingRegistrationPayment();
        toast.error("Payment failed", {
          description: "Payment failed or was cancelled.",
        });
        setState({
          kind: "failure",
          message:
            "Your payment didn't go through or was cancelled. Your entry is saved as Unpaid — you can pay again below or later from My entries.",
        });
        return;
      }

      if (outcome === "unknown") {
        setState({
          kind: "error",
          message:
            "We could not confirm the payment status from the gateway response. Your entry stays Unpaid. If you were charged, contact support with your order ID.",
        });
        return;
      }

      setState({
        kind: "loading",
        message: "Payment received. Confirming your registration…",
      });

      try {
        await confirmRegistrationPayment(found._id, {
          order_id: effectiveOrderId,
          transaction_id: summary.transactionId,
        });
        clearPendingRegistrationPayment();
        await queryClient.invalidateQueries({
          queryKey: queryKeys.registrations.all,
        });
        toast.success("Payment confirmed", {
          description: "Your Jeep Rally entry is now paid.",
        });
        setState({
          kind: "success",
          message: "Payment successful. Your registration is now paid.",
        });
        navigate(registrationSuccessPath(found._id), { replace: true });
      } catch (err) {
        toast.error(getApiErrorMessage(err));
        setState({
          kind: "error",
          message:
            getApiErrorMessage(err) +
            " Payment may have succeeded — your entry is still Unpaid. Contact support with your order ID if this persists.",
        });
      }
    };

    void run();
  }, [navigate, queryClient]);

  const handlePayAgain = async () => {
    if (!registration) return;
    setRetrying(true);
    try {
      await retryRegistrationPayment(registration);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setRetrying(false);
    }
  };

  const icon =
    state.kind === "loading" ? (
      <Loader2Icon className="size-10 animate-spin text-primary" />
    ) : state.kind === "success" || state.kind === "thanks" ? (
      <CheckCircle2Icon className="size-10 text-[#1F7A4D]" />
    ) : state.kind === "failure" ? (
      <XCircleIcon className="size-10 text-[#E04444]" />
    ) : (
      <AlertCircleIcon className="size-10 text-[#E04444]" />
    );

  const showOrder =
    order &&
    (state.kind === "failure" ||
      state.kind === "error" ||
      state.kind === "thanks");

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg overflow-hidden rounded-md border border-[#E8E8E8] bg-white text-center shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex justify-center">
            <div
              className={
                state.kind === "failure" || state.kind === "error"
                  ? "flex size-16 items-center justify-center rounded-full bg-[#FFF0F0]"
                  : "flex size-16 items-center justify-center rounded-full bg-[#F9FAFD]"
              }
            >
              {icon}
            </div>
          </div>
          <Typography
            as="h1"
            variant="h5"
            className="text-[22px] font-semibold text-[#25314D]"
          >
            {state.kind === "loading"
              ? confirmStartedAt != null
                ? "Processing your payment"
                : "Processing payment"
              : state.kind === "success"
                ? "Payment successful"
                : state.kind === "thanks"
                  ? "Thank you!"
                  : state.kind === "failure"
                    ? "Payment failed"
                    : "Something went wrong"}
          </Typography>
          <Typography variant="body-sm" className="text-[#6B7890]">
            {state.message}
          </Typography>
          {state.kind === "loading" && confirmStartedAt != null ? (
            <div className="space-y-3 pt-2 text-left">
              <ul className="space-y-2">
                {PROCESSING_STEPS.map((label, i) => {
                  const done = i < activeStep;
                  const active = i === activeStep;
                  return (
                    <li
                      key={label}
                      className={cn(
                        "flex items-center gap-2 text-[14px]",
                        done || active ? "text-[#25314D]" : "text-[#8A95B5]",
                        active && "font-semibold",
                      )}
                    >
                      {done ? (
                        <CheckCircle2Icon className="size-4 text-[#1F7A4D]" />
                      ) : active ? (
                        <Loader2Icon className="size-4 animate-spin text-primary" />
                      ) : (
                        <span className="size-4 rounded-full border border-[#D5DAE8]" />
                      )}
                      {label}
                    </li>
                  );
                })}
              </ul>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E8E8E8]">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${Math.max(6, confirmProgress * 100)}%` }}
                />
              </div>
            </div>
          ) : null}
          {state.kind === "failure" ? (
            <span className="inline-flex rounded-full border border-[#F2D6D6] bg-[#FFF5F5] px-3 py-1 text-[12px] font-semibold tracking-wide text-[#B42323] uppercase">
              {registration ? "Unpaid · Payment pending" : "Unpaid · Not registered"}
            </span>
          ) : null}
        </div>

        {showOrder ? (
          <dl className="grid gap-4 border-t border-[#E8E8E8] bg-[#F9FAFD] px-6 py-5 text-left sm:grid-cols-2 sm:px-8">
            <OrderItem label="Order ID" value={order.orderId} />
            <OrderItem label="Amount" value={formatRallyAmount(order.amount)} />
            {order.transactionId ? (
              <OrderItem label="Transaction ID" value={order.transactionId} />
            ) : null}
            {order.gatewayStatus ? (
              <OrderItem label="Gateway status" value={order.gatewayStatus} />
            ) : null}
            <div className="sm:col-span-2">
              <OrderItem label="Entry" value={order.description} />
            </div>
          </dl>
        ) : null}

        {state.kind === "thanks" ? (
          <div className="flex flex-col gap-3 border-t border-[#E8E8E8] px-6 py-5 sm:flex-row sm:justify-center sm:px-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to={ROUTES.MY_REGISTRATIONS}>View my entries</Link>
            </Button>
          </div>
        ) : null}

        {state.kind === "failure" || state.kind === "error" ? (
          <div className="flex flex-col gap-3 border-t border-[#E8E8E8] px-6 py-5 sm:flex-row sm:justify-center sm:px-8">
            {isRegistrationUnpaid(registration) ? (
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto"
                disabled={retrying}
                onClick={() => void handlePayAgain()}
              >
                {retrying ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <RotateCcwIcon className="size-4" />
                )}
                {retrying ? "Starting payment…" : "Pay again"}
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to={ROUTES.REGISTRATION}>
                  <RotateCcwIcon className="size-4" />
                  Back to registration
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to={ROUTES.MY_REGISTRATIONS}>My entries</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OrderItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] tracking-wide text-[#8A95B5] uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-[14px] font-medium break-words text-[#1F1838]">
        {value}
      </dd>
    </div>
  );
}
