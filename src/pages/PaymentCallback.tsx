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
import { queryKeys } from "@/api/query-keys";
import { createRegistration } from "@/api/services/registrations";
import { registrationSuccessPath, ROUTES } from "@/utils/constants";
import {
  parsePaymentCallbackParams,
  resolvePaymentCallbackOutcome,
} from "@/utils/payment-callback";
import {
  clearPendingRegistrationPayment,
  loadPendingRegistrationPayment,
  type PendingRegistrationPayment,
} from "@/utils/pending-registration-payment";
import { formatRallyAmount } from "@/utils/rally-pricing";

type CallbackState =
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

function toOrderSummary(
  pending: PendingRegistrationPayment,
  href: string,
): OrderSummary {
  const parsed = parsePaymentCallbackParams(href);
  return {
    orderId: pending.orderId,
    amount: pending.amount,
    description: pending.orderDescription,
    gatewayStatus: parsed.status,
    transactionId: parsed.transactionId,
  };
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

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const run = async () => {
      const pending = loadPendingRegistrationPayment();
      if (!pending) {
        setState({
          kind: "error",
          message:
            "No pending registration payment was found. Please start registration again.",
        });
        return;
      }

      const summary = toOrderSummary(pending, window.location.href);
      setOrder(summary);

      const outcome = resolvePaymentCallbackOutcome(
        window.location.href,
        pending.orderId,
      );

      const looksFailed =
        outcome === "unknown" &&
        /fail|cancel|declined/.test(window.location.href.toLowerCase());

      if (outcome === "failure" || looksFailed) {
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

      if (outcome === "unknown") {
        setState({
          kind: "error",
          message:
            "We could not confirm the payment status from the gateway response. If you were charged, contact support with your order ID, or return to registration to try again.",
        });
        return;
      }

      setState({
        kind: "loading",
        message: "Payment received. Submitting your registration…",
      });

      try {
        const created = await createRegistration({
          ...pending.payload,
          payment: {
            ...pending.payload.payment,
            amount: pending.amount,
            order_id: pending.orderId,
            transaction_id: summary.transactionId,
          },
        });
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
        const createdId = created.data?._id;
        navigate(
          createdId ? registrationSuccessPath(createdId) : ROUTES.MY_REGISTRATIONS,
          { replace: true },
        );
      } catch (err) {
        toast.error(getApiErrorMessage(err));
        setState({
          kind: "error",
          message:
            getApiErrorMessage(err) +
            " Payment may have succeeded — contact support with your order ID if this persists.",
        });
      }
    };

    void run();
  }, [navigate, queryClient]);

  const icon =
    state.kind === "loading" ? (
      <Loader2Icon className="size-10 animate-spin text-primary" />
    ) : state.kind === "success" ? (
      <CheckCircle2Icon className="size-10 text-[#1F7A4D]" />
    ) : state.kind === "failure" ? (
      <XCircleIcon className="size-10 text-[#E04444]" />
    ) : (
      <AlertCircleIcon className="size-10 text-[#E04444]" />
    );

  const showOrder = order && (state.kind === "failure" || state.kind === "error");

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
              ? "Processing payment"
              : state.kind === "success"
                ? "Payment successful"
                : state.kind === "failure"
                  ? "Payment failed"
                  : "Something went wrong"}
          </Typography>
          <Typography variant="body-sm" className="text-[#6B7890]">
            {state.message}
          </Typography>
          {state.kind === "failure" ? (
            <span className="inline-flex rounded-full border border-[#F2D6D6] bg-[#FFF5F5] px-3 py-1 text-[12px] font-semibold tracking-wide text-[#B42323] uppercase">
              Unpaid · Not registered
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

        {state.kind === "failure" || state.kind === "error" ? (
          <div className="flex flex-col gap-3 border-t border-[#E8E8E8] px-6 py-5 sm:flex-row sm:justify-center sm:px-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to={ROUTES.REGISTRATION}>
                <RotateCcwIcon className="size-4" />
                Try again
              </Link>
            </Button>
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
