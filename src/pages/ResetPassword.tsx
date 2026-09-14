import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { FormCommon, Input } from "@/components/common/FormCommon";
import { ButtonSpinner } from "@/components/common/LoadingStates";
import { Typography } from "@/components/common/Typography";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { useResetPasswordMutation } from "@/hooks/api/use-forgot-password";
import { useRedirectIfAuthenticated } from "@/hooks/use-auth-redirect";
import { ROUTES } from "@/utils/constants";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/utils/zodSchema";

const defaultValues: ResetPasswordValues = {
  token: "",
  password: "",
  confirmPassword: "",
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  useRedirectIfAuthenticated();
  const resetMutation = useResetPasswordMutation();

  const emailFromForgot =
    (location.state as { email?: string } | null)?.email?.trim() ?? "";

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<ResetPasswordValues> = (values) => {
    resetMutation.mutate(
      {
        token: values.token.trim(),
        password: values.password,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Password reset successfully");
          void navigate(ROUTES.LOGIN, { replace: true });
        },
      },
    );
  };

  const apiError =
    resetMutation.isError && resetMutation.error
      ? getApiErrorMessage(resetMutation.error)
      : null;

  return (
    <AuthLayout
      title="Reset password"
      subtitle={
        emailFromForgot
          ? `Enter the OTP sent to ${emailFromForgot}, then choose a new password.`
          : "Enter the OTP from your email, then choose a new password."
      }
    >
      <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
        {apiError ? (
          <Typography as="p" variant="body-sm" className="text-destructive">
            {apiError}
          </Typography>
        ) : null}

        <Input
          control={form.control}
          name="token"
          label="OTP code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter 6-digit OTP"
          className={authInputClassName}
        />
        <Input
          control={form.control}
          name="password"
          label="New password"
          required
          type="password"
          placeholder="Enter new password"
          autoComplete="new-password"
          className={authInputClassName}
        />
        <Input
          control={form.control}
          name="confirmPassword"
          label="Confirm password"
          required
          type="password"
          placeholder="Re-enter new password"
          autoComplete="new-password"
          className={authInputClassName}
        />

        <Button
          type="submit"
          disabled={resetMutation.isPending}
          aria-busy={resetMutation.isPending}
          className="mt-2 h-12 w-full rounded-md text-[16px] font-medium"
        >
          {resetMutation.isPending ? (
            <ButtonSpinner className="size-6 text-primary-foreground" />
          ) : (
            <Typography as="span" variant="body" color="inherit">
              Reset password
            </Typography>
          )}
        </Button>
      </FormCommon>

      <div className="mt-7 space-y-2 text-center">
        <div>
          <Typography as="span" variant="body-sm" className="text-[#6B7280]">
            Didn’t get a code?{" "}
          </Typography>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="font-medium text-primary hover:underline"
          >
            <Typography as="span" variant="body-sm" color="inherit">
              Resend OTP
            </Typography>
          </Link>
        </div>
        <div>
          <Link
            to={ROUTES.LOGIN}
            className="font-medium text-primary hover:underline"
          >
            <Typography as="span" variant="body-sm" color="inherit">
              Back to login
            </Typography>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
