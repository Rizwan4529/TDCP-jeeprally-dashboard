import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { Link, useNavigate } from "react-router-dom"
import { useForm, type SubmitHandler } from "react-hook-form"

import {
  Checkbox,
  DatePicker,
  FormCommon,
  Input,
} from "@/components/common/FormCommon"
import { Typography } from "@/components/common/Typography"
import AuthLayout from "@/components/layout/AuthLayout"
import { useRegisterMutation } from "@/hooks/api/use-register"
import { Button } from "@/components/ui/button"
import { setAccessToken } from "@/lib/api/token"
import type { RegisterResponse } from "@/lib/api/types/auth"
import {
  signupSchema,
  type SignupValues,
} from "@/utils/zodSchema"

const defaultValues: SignupValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  contactNumber: "",
  cnic: "",
  dateOfBirth: "",
  acceptedTerms: false,
}

const authInputClassName =
  "h-12 w-full rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]"

function persistTokenFromRegisterResponse(data: RegisterResponse): boolean {
  if (typeof data !== "object" || data === null) {
    return false
  }

  const record = data as Record<string, unknown>
  const token =
    typeof record.access_token === "string"
      ? record.access_token
      : typeof record.token === "string"
        ? record.token
        : null

  if (token) {
    setAccessToken(token)
    return true
  }

  return false
}

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

export default function SignupPage() {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues,
  })

  const onSubmit: SubmitHandler<SignupValues> = (values) => {
    registerMutation.mutate(
      {
        name: values.fullName,
        email: values.email,
        password: values.password,
        contact_number: values.contactNumber,
        cnic: values.cnic,
        date_of_birth: values.dateOfBirth,
      },
      {
        onSuccess: (data) => {
          const hasToken = persistTokenFromRegisterResponse(data)
          navigate(hasToken ? "/dashboard" : "/login", { replace: true })
        },
      },
    )
  }

  const apiError =
    registerMutation.isError && registerMutation.error
      ? getApiErrorMessage(registerMutation.error)
      : null

  return (
    <AuthLayout
      title="Create account"
      subtitle="Set up your Jeep Rally dashboard account with a few details."
    >
      <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
        <Input
          control={form.control}
          name="fullName"
          label="Full name"
          placeholder="Enter full name"
          autoComplete="name"
          className={authInputClassName}
        />
        <Input
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="Enter email"
          autoComplete="email"
          className={authInputClassName}
        />
        <Input
          control={form.control}
          name="contactNumber"
          label="Contact number"
          type="tel"
          inputMode="numeric"
          placeholder="03001234567"
          autoComplete="tel"
          maxLength={11}
          className={authInputClassName}
        />
        <Input
          control={form.control}
          name="cnic"
          label="CNIC"
          inputMode="numeric"
          placeholder="13-digit CNIC without dashes"
          autoComplete="off"
          maxLength={13}
          className={authInputClassName}
        />
        <DatePicker
          control={form.control}
          name="dateOfBirth"
          label="Date of birth"
          placeholder="Select date of birth"
          displayFormat="dmy"
          className={authInputClassName}
        />
        <Input
          control={form.control}
          name="password"
          label="Password"
          type="password"
          placeholder="Create password"
          autoComplete="new-password"
          className={authInputClassName}
        />
        <Input
          control={form.control}
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          className={authInputClassName}
        />

        <Checkbox
          control={form.control}
          name="acceptedTerms"
          label="I agree to the Terms & Conditions."
          checkboxClassName="size-5 border-[#CED4DF] bg-white"
          itemClassName="items-center"
        />

        {apiError ? (
          <p className="text-sm leading-relaxed text-destructive" role="alert">
            {apiError}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-2 h-12 w-full rounded-md text-[16px] font-medium disabled:opacity-70"
        >
          <Typography as="span" variant="body" color="inherit">
            {registerMutation.isPending ? "Creating account…" : "Create Account"}
          </Typography>
        </Button>
      </FormCommon>

      <div className="mt-7 text-center">
        <Typography as="span" variant="body-sm" className="text-[#6B7280]">
          Already have an account?{" "}
        </Typography>
        <Link to="/login" className="font-medium text-primary hover:underline">
          <Typography as="span" variant="body-sm" color="inherit">
            Login
          </Typography>
        </Link>
      </div>
    </AuthLayout>
  )
}
