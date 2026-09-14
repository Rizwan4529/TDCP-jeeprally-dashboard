import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { FormCommon, Input } from "@/components/common/FormCommon";
import { ButtonSpinner } from "@/components/common/LoadingStates";
import { Typography } from "@/components/common/Typography";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { useForgotPasswordMutation } from "@/hooks/api/use-forgot-password";
import { useRedirectIfAuthenticated } from "@/hooks/use-auth-redirect";
import { ROUTES } from "@/utils/constants";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/utils/zodSchema";

const defaultValues: ForgotPasswordValues = {
  email: "",
};

const authInputClassName =
  "h-12 w-full rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]";

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data;
    if (typeof body === "string" && body.trim()) return body;
    if (typeof body === "object" && body !== null) {
      const record = body as Record<string, unknown>;
      if (typeof record.message === "string") return record.message;
    }
    return error.message || "Request failed";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  useRedirectIfAuthenticated();
  const forgotMutation = useForgotPasswordMutation();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<ForgotPasswordValues> = (values) => {
    const email = values.email.trim();
    forgotMutation.mutate(
      { email },
      {
        onSuccess: (response) => {
          toast.success(
            response.message ||
              "If this email is registered, a reset OTP has been sent",
          );
          void navigate(ROUTES.RESET_PASSWORD, {
            replace: true,
            state: { email },
          });
        },
      },
    );
  };

  const apiError =
    forgotMutation.isError && forgotMutation.error
      ? getApiErrorMessage(forgotMutation.error)
      : null;

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your account email and we’ll send a one-time code to reset your password."
    >
      <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
        {apiError ? (
          <Typography as="p" variant="body-sm" className="text-destructive">
            {apiError}
          </Typography>
        ) : null}
        <Input
          control={form.control}
          name="email"
          label="Email"
          required
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          className={authInputClassName}
        />

        <Button
          type="submit"
          disabled={forgotMutation.isPending}
          aria-busy={forgotMutation.isPending}
          className="mt-2 h-12 w-full rounded-md text-[16px] font-medium"
        >
          {forgotMutation.isPending ? (
            <ButtonSpinner className="size-6 text-primary-foreground" />
          ) : (
            <Typography as="span" variant="body" color="inherit">
              Send OTP
            </Typography>
          )}
        </Button>
      </FormCommon>

      <div className="mt-7 text-center">
        <Typography as="span" variant="body-sm" className="text-[#6B7280]">
          Remembered your password?{" "}
        </Typography>
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-primary hover:underline"
        >
          <Typography as="span" variant="body-sm" color="inherit">
            Back to login
          </Typography>
        </Link>
      </div>
    </AuthLayout>
  );
}
