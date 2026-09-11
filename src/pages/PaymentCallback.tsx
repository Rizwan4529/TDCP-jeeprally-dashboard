import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";

import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { createRegistration } from "@/api/services/registrations";
import { ROUTES } from "@/utils/constants";
import { resolvePaymentCallbackOutcome } from "@/utils/payment-callback";
import {
  clearPendingRegistrationPayment,
  loadPendingRegistrationPayment,
} from "@/utils/pending-registration-payment";

type CallbackState =
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string }
  | { kind: "failure"; message: string }
  | { kind: "error"; message: string };

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

export default function PaymentCallbackPage() {
  const navigate = useNavigate();
  const handledRef = useRef(false);
  const [state, setState] = useState<CallbackState>({
    kind: "loading",
    message: "Confirming your payment…",
  });

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

      const outcome = resolvePaymentCallbackOutcome(
        window.location.href,
        pending.orderId,
      );

      if (outcome === "failure") {
        clearPendingRegistrationPayment();
        toast.error("Payment Failed", {
          description: "Payment failed or was cancelled.",
        });
        setState({
          kind: "failure",
          message: "Payment failed or was cancelled. You can try again from registration.",
        });
        return;
      }

      if (outcome === "unknown") {
        const url = window.location.href.toLowerCase();
        const looksFailed =
          url.includes("fail") ||
          url.includes("cancel") ||
          url.includes("declined");
        if (looksFailed) {
          clearPendingRegistrationPayment();
          toast.error("Payment Failed");
          setState({
            kind: "failure",
            message: "Payment failed or was cancelled.",
          });
          return;
        }

        setState({
          kind: "error",
          message:
            "We could not confirm payment status from the gateway response. If you were charged, contact support with your order id, or return to registration to try again.",
        });
        return;
      }

      setState({
        kind: "loading",
        message: "Payment received. Submitting your registration…",
      });

      try {
        await createRegistration(pending.payload);
        clearPendingRegistrationPayment();
        toast.success("Registration submitted", {
          description: "Your Jeep Rally entry has been received.",
        });
        setState({
          kind: "success",
          message: "Payment successful. Your registration has been submitted.",
        });
        window.setTimeout(() => {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }, 1500);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
        setState({
          kind: "error",
          message:
            getApiErrorMessage(err) +
            " Payment may have succeeded — contact support if this persists.",
        });
      }
    };

    void run();
  }, [navigate]);

  const icon =
    state.kind === "loading" ? (
      <Loader2Icon className="size-10 animate-spin text-[#43AA72]" />
    ) : state.kind === "success" ? (
      <CheckCircle2Icon className="size-10 text-[#43AA72]" />
    ) : (
      <AlertCircleIcon className="size-10 text-[#E04444]" />
    );

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-5 rounded-md border border-[#E8E8E8] bg-white p-6 text-center shadow-[0_8px_22px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="flex justify-center">{icon}</div>
        <Typography
          as="h1"
          variant="h5"
          className="text-[20px] font-semibold text-[#25314D]"
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

        {state.kind === "failure" || state.kind === "error" ? (
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
            <Button asChild className="h-11 rounded-md px-6">
              <Link to="/registration">Back to registration</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-md px-6">
              <Link to={ROUTES.DASHBOARD}>Go to dashboard</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
