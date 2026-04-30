import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { useForm, type SubmitHandler } from "react-hook-form"

import {
  Checkbox,
  FormCommon,
  Input,
} from "@/components/common/FormCommon"
import { Typography } from "@/components/common/Typography"
import AuthLayout from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import {
  signupSchema,
  type SignupValues,
} from "@/utils/zodSchema"

const defaultValues: SignupValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
}

const authInputClassName =
  "h-12 w-full rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]"

export default function SignupPage() {
  const navigate = useNavigate()
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues,
  })

  const onSubmit: SubmitHandler<SignupValues> = (values) => {
    console.log("Signup form", values)
    navigate("/dashboard")
  }

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

        <Button
          type="submit"
          className="mt-2 h-12 w-full rounded-md text-[16px] font-medium"
        >
          <Typography as="span" variant="body" color="inherit">
            Create Account
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
