import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { useForm, type SubmitHandler } from "react-hook-form"

import { FormCommon, Input } from "@/components/common/FormCommon"
import { Typography } from "@/components/common/Typography"
import AuthLayout from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
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

export default function LoginPage() {
  const navigate = useNavigate()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  })

  const onSubmit: SubmitHandler<LoginValues> = (values) => {
    console.log("Login form", values)
    navigate("/dashboard")
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your login details to continue to the Jeep Rally dashboard."
    >
      <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
        <Input
          control={form.control}
          name="login"
          label="Email or username"
          placeholder="Enter email or username"
          autoComplete="username"
          className={authInputClassName}
        />
        <Input
          control={form.control}
          name="password"
          label="Password"
          type="password"
          placeholder="Enter password"
          autoComplete="current-password"
          className={authInputClassName}
        />

        <Button
          type="submit"
          className="mt-2 h-12 w-full rounded-md text-[16px] font-medium"
        >
          <Typography as="span" variant="body" color="inherit">
            Login
          </Typography>
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
