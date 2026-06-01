import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { Link, useNavigate } from "react-router-dom"
import { useForm, type SubmitHandler } from "react-hook-form"

import { FormCommon, Input } from "@/components/common/FormCommon"
import { ButtonSpinner } from "@/components/common/LoadingStates"
import { Typography } from "@/components/common/Typography"
import AuthLayout from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { useLoginMutation } from "@/hooks/api/use-login"
import { useRedirectIfAuthenticated } from "@/hooks/use-auth-redirect"
import { ROUTES } from "@/utils/constants"
import {
  loginSchema,
  type LoginValues,
} from "@/utils/zodSchema"

const defaultValues: LoginValues = {
  login: "",
  password: "",
}

const authInputClassName =
  "h-12 w-full rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]"

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data

    if (typeof body === "string" && body.trim()) {
      return body
    }

    if (typeof body === "object" && body !== null) {
      const record = body as Record<string, unknown>

      if (typeof record.message === "string") {
        return record.message
      }

      if (typeof record.detail === "string") {
        return record.detail
      }

      if (
        Array.isArray(record.detail) &&
        record.detail.length > 0 &&
        typeof record.detail[0] === "object" &&
        record.detail[0] !== null &&
        "msg" in record.detail[0] &&
        typeof (record.detail[0] as { msg: unknown }).msg === "string"
      ) {
        return (record.detail[0] as { msg: string }).msg
      }
    }

    return error.message || "Request failed"
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong. Please try again."
}

export default function LoginPage() {
  const navigate = useNavigate()
  useRedirectIfAuthenticated()
  const loginMutation = useLoginMutation()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  })

  const onSubmit: SubmitHandler<LoginValues> = (values) => {
    loginMutation.mutate(
      {
        email: values.login.trim(),
        password: values.password,
      },
      {
        onSuccess: () => {
          navigate(ROUTES.DASHBOARD, { replace: true })
        },
      },
    )
  }

  const apiError =
    loginMutation.isError && loginMutation.error
      ? getApiErrorMessage(loginMutation.error)
      : null

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your login details to continue to the Jeep Rally dashboard."
    >
      <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
        {apiError ? (
          <Typography as="p" variant="body-sm" className="text-destructive">
            {apiError}
          </Typography>
        ) : null}
        <Input
          control={form.control}
          name="login"
          label="Email or username"
          required
          placeholder="Enter email or username"
          autoComplete="username"
          className={authInputClassName}
        />
        <Input
          control={form.control}
          name="password"
          label="Password"
          required
          type="password"
          placeholder="Enter password"
          autoComplete="current-password"
          className={authInputClassName}
        />

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          aria-busy={loginMutation.isPending}
          className="mt-2 h-12 w-full rounded-md text-[16px] font-medium"
        >
          {loginMutation.isPending ? (
            <ButtonSpinner className="size-6 text-primary-foreground" />
          ) : (
            <Typography as="span" variant="body" color="inherit">
              Login
            </Typography>
          )}
        </Button>
      </FormCommon>

      <div className="mt-7 text-center">
        <Typography as="span" variant="body-sm" className="text-[#6B7280]">
          Don't have an account?{" "}
        </Typography>
        <Link to="/signup" className="font-medium text-primary hover:underline">
          <Typography as="span" variant="body-sm" color="inherit">
            Sign up
          </Typography>
        </Link>
      </div>
    </AuthLayout>
  )
}
