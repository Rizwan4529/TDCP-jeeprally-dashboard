import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";

import {
  Checkbox,
  DatePicker,
  FormCommon,
  ImagePicker,
  Input,
  Select,
  Textarea,
} from "@/components/common/FormCommon";
import { ButtonSpinner } from "@/components/common/LoadingStates";
import { Typography } from "@/components/common/Typography";
import AuthLayout from "@/components/layout/AuthLayout";
import { useRegisterMutation } from "@/hooks/api/use-register";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/api/query-keys";
import { updateAuthToken, updateAuthUser } from "@/utils/helpers";
import { parseLoginUserFromApiEnvelope } from "@/utils/profile-driver";
import type { RegisterResponse } from "@/api/types/auth";
import { signupSchema, type SignupValues } from "@/utils/zodSchema";
import { GENDER_OPTIONS } from "@/utils/constants";

const defaultValues: SignupValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  age: "",
  address: "",
  contactNumber: "",
  licenseNumber: "",
  licenseExpiry: "",
  cnic: "",
  dateOfBirth: "",
  occupation: "",
  profileImage: null,
  cnicImage: null,
  licenseImage: null,
  acceptedTerms: false,
};

const authInputClassName =
  "h-12 w-full rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]";

const genderSelectOptions = GENDER_OPTIONS.map((o) => ({
  label: o.label,
  value: o.value,
}));

function persistTokenFromRegisterResponse(data: RegisterResponse): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const record = data as Record<string, unknown>;
  const nestedData = record.data;
  const fromEnvelope =
    typeof nestedData === "object" &&
    nestedData !== null &&
    "accessToken" in nestedData &&
    typeof (nestedData as { accessToken: unknown }).accessToken === "string"
      ? (nestedData as { accessToken: string }).accessToken
      : null;

  const token =
    fromEnvelope ??
    (typeof record.access_token === "string"
      ? record.access_token
      : typeof record.accessToken === "string"
        ? record.accessToken
        : typeof record.token === "string"
          ? record.token
          : null);

  if (token) {
    updateAuthToken(token);
    return true;
  }

  return false;
}

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data;

    if (typeof body === "string" && body.trim()) {
      return body;
    }

    if (typeof body === "object" && body !== null) {
      const record = body as Record<string, unknown>;

      if (typeof record.message === "string") {
        return record.message;
      }

      if (typeof record.detail === "string") {
        return record.detail;
      }

      if (
        Array.isArray(record.detail) &&
        record.detail.length > 0 &&
        typeof record.detail[0] === "object" &&
        record.detail[0] !== null &&
        "msg" in record.detail[0] &&
        typeof (record.detail[0] as { msg: unknown }).msg === "string"
      ) {
        return (record.detail[0] as { msg: string }).msg;
      }
    }

    return error.message || "Request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function SignupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const registerMutation = useRegisterMutation();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<SignupValues> = (values) => {
    registerMutation.mutate(
      {
        name: values.fullName,
        email: values.email,
        password: values.password,
        gender: values.gender,
        age: values.age,
        address: values.address,
        contact_number: values.contactNumber,
        license_number: values.licenseNumber,
        license_expiry: values.licenseExpiry,
        cnic: values.cnic,
        date_of_birth: values.dateOfBirth,
        occupation: values.occupation,
        profile_image: values.profileImage!,
        cnic_image: values.cnicImage!,
        license_image: values.licenseImage!,
      },
      {
        onSuccess: (data) => {
          const hasToken = persistTokenFromRegisterResponse(data);
          const user = parseLoginUserFromApiEnvelope(data);
          if (user) {
            updateAuthUser(user);
            queryClient.setQueryData(queryKeys.auth.sessionUser(), user);
          }
          navigate(hasToken ? "/dashboard" : "/login", { replace: true });
        },
      },
    );
  };

  const apiError =
    registerMutation.isError && registerMutation.error
      ? getApiErrorMessage(registerMutation.error)
      : null;

  return (
    <AuthLayout
      title="Create account"
      subtitle="Set up your Jeep Rally dashboard account with a few details."
    >
      <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
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
          <Select
            control={form.control}
            name="gender"
            label="Gender"
            placeholder="Select gender"
            options={genderSelectOptions}
            className={authInputClassName}
          />
          <Input
            control={form.control}
            name="age"
            label="Age"
            inputMode="numeric"
            placeholder="e.g. 32"
            autoComplete="off"
            maxLength={3}
            className={authInputClassName}
          />
        </div>

        <Textarea
          control={form.control}
          name="address"
          label="Address"
          placeholder="Street, city"
          rows={3}
          className={authInputClassName}
        />

        <div className="grid gap-5 md:grid-cols-2">
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
            name="licenseNumber"
            label="License number"
            placeholder="Driving license number"
            autoComplete="off"
            className={authInputClassName}
          />
          <DatePicker
            control={form.control}
            name="licenseExpiry"
            label="License expiry"
            placeholder="Select expiry date"
            displayFormat="dmy"
            calendarYearsFuture={50}
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
            name="occupation"
            label="Occupation"
            placeholder="Your profession"
            autoComplete="organization-title"
            className={authInputClassName}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
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
        </div>

        <div className="grid gap-5 md:grid-cols-1 sm:grid-cols-3">
          <ImagePicker
            control={form.control}
            name="profileImage"
            label="Profile photo"
            accept="image/*"
            variant="compact"
          />
          <ImagePicker
            control={form.control}
            name="cnicImage"
            label="CNIC image"
            accept="image/*"
            variant="compact"
          />
          <ImagePicker
            control={form.control}
            name="licenseImage"
            label="License image"
            accept="image/*"
            variant="compact"
          />
        </div>

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
          aria-busy={registerMutation.isPending}
          className="mt-2 h-12 w-full rounded-md text-[16px] font-medium disabled:opacity-70"
        >
          {registerMutation.isPending ? (
            <ButtonSpinner className="size-6 text-primary-foreground" />
          ) : (
            <Typography as="span" variant="body" color="inherit">
              Create Account
            </Typography>
          )}
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
  );
}
