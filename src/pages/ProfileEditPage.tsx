import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  DatePicker,
  FormCommon,
  ImagePicker,
  Input as FormInput,
  Select,
  Textarea,
} from "@/components/common/FormCommon";
import { PageHeader } from "@/components/common/NavigationCommon";
import { Typography } from "@/components/common/Typography";
import {
  SCROLL_PAGE,
  SIDEBAR_PAGE_PADDING,
} from "@/components/layout/pageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUpdateProfileMutation } from "@/hooks/api/use-update-profile";
import { useSessionUser } from "@/hooks/api/use-session-user";
import { cn } from "@/lib/utils";
import { GENDER_OPTIONS, ROUTES } from "@/utils/constants";
import { toDateOnlyInputValue, toPublicFileUrl } from "@/utils/helpers";
import { sessionToProfileDriver } from "@/utils/profile-driver";
import {
  buildUpdateProfilePayload,
  hasUpdateProfileChanges,
} from "@/utils/profile-update";
import {
  profileUpdateSchema,
  type ProfileUpdateValues,
} from "@/utils/zodSchema";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

const genderSelectOptions = GENDER_OPTIONS.map((o) => ({
  label: o.label,
  value: o.value,
}));

const profileFormDefaults: ProfileUpdateValues = {
  name: "",
  gender: "",
  age: "",
  address: "",
  location: "",
  contact_number: "",
  license_number: "",
  license_expiry: "",
  cnic: "",
  date_of_birth: "",
  occupation: "",
  profile_image: null,
  cnic_image: null,
  license_image: null,
};

const profileFieldClassName =
  "h-11 w-full rounded-md border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838]";

export default function ProfileEditPage() {
  return <ProfileEditScreen />;
}

function ProfileEditScreen() {
  const navigate = useNavigate();
  const { data: sessionUser } = useSessionUser();
  const driver = React.useMemo(
    () => (sessionUser ? sessionToProfileDriver(sessionUser) : null),
    [sessionUser],
  );

  const updateProfileMutation = useUpdateProfileMutation();

  const driverForm = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: profileFormDefaults,
    values: driver
      ? {
          name: driver.name,
          gender: driver.gender ?? "",
          age:
            driver.age != null && String(driver.age).trim() !== ""
              ? String(driver.age)
              : "",
          address: driver.address ?? "",
          location: driver.location ?? "",
          contact_number: driver.contact_number,
          license_number: driver.license_number ?? "",
          license_expiry: toDateOnlyInputValue(driver.license_expiry),
          cnic: driver.cnic ?? "",
          date_of_birth: toDateOnlyInputValue(driver.date_of_birth),
          occupation: driver.occupation ?? "",
          profile_image: null,
          cnic_image: null,
          license_image: null,
        }
      : undefined,
  });

  const onSubmitDriverProfile: SubmitHandler<ProfileUpdateValues> = async (
    values,
  ) => {
    const payload = buildUpdateProfilePayload(values, sessionUser ?? null);
    if (!hasUpdateProfileChanges(payload)) {
      toast.message("No changes to save.");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(payload);
      toast.success("Profile updated.");
      navigate(ROUTES.PROFILE);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not update profile. Please try again.";
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    driverForm.reset(profileFormDefaults);
    navigate(ROUTES.PROFILE);
  };

  return (
    <div className={cn(SCROLL_PAGE, SIDEBAR_PAGE_PADDING, "pb-8")}>
      <div className="space-y-6 pb-6">
        <PageHeader title="Edit profile" />

        <Card className={cn(surface, "shrink-0 overflow-visible rounded-md")}>
          <div className="border-b border-[#E8E8E8] px-6 py-5">
            <Typography
              as="h3"
              variant="label"
              className="text-[14px] font-bold tracking-wide text-[#1F1838]"
            >
              DRIVER INFORMATION
            </Typography>
          </div>

          <div className="px-6 py-6">
            {!driver ? (
              <Typography variant="body-sm" className="text-[#6B7890]">
                No driver profile loaded yet.
              </Typography>
            ) : (
              <FormCommon
                form={driverForm}
                onSubmit={onSubmitDriverProfile}
                className="space-y-5"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <FormInput
                    control={driverForm.control}
                    name="name"
                    label="Full name"
                    required
                    className={profileFieldClassName}
                  />
                  <Select
                    control={driverForm.control}
                    name="gender"
                    label="Gender"
                    required
                    placeholder="Select gender"
                    options={genderSelectOptions}
                    className={profileFieldClassName}
                  />
                  <FormInput
                    control={driverForm.control}
                    name="age"
                    label="Age"
                    required
                    inputMode="numeric"
                    maxLength={3}
                    className={profileFieldClassName}
                  />
                  <FormInput
                    control={driverForm.control}
                    name="occupation"
                    label="Occupation"
                    required
                    className={profileFieldClassName}
                  />
                </div>
                <Textarea
                  control={driverForm.control}
                  name="address"
                  label="Address"
                  required
                  rows={3}
                  className={profileFieldClassName}
                />
                {/* <FormInput
                  control={driverForm.control}
                  name="location"
                  label="Location"
                  placeholder="e.g. Punjab"
                  className={profileFieldClassName}
                /> */}
                <div className="grid gap-5 md:grid-cols-2">
                  <FormInput
                    control={driverForm.control}
                    name="contact_number"
                    label="Contact number"
                    required
                    inputMode="numeric"
                    maxLength={11}
                    className={profileFieldClassName}
                  />
                  <FormInput
                    control={driverForm.control}
                    name="license_number"
                    label="License number"
                    required
                    className={profileFieldClassName}
                  />
                  <DatePicker
                    control={driverForm.control}
                    name="license_expiry"
                    label="License expiry"
                    required
                    placeholder="YYYY-MM-DD"
                    calendarYearsFuture={50}
                    className={profileFieldClassName}
                  />
                  <FormInput
                    control={driverForm.control}
                    name="cnic"
                    label="CNIC"
                    required
                    inputMode="numeric"
                    maxLength={13}
                    className={profileFieldClassName}
                  />
                  <DatePicker
                    control={driverForm.control}
                    name="date_of_birth"
                    label="Date of birth"
                    required
                    placeholder="YYYY-MM-DD"
                    className={profileFieldClassName}
                  />
                </div>
                <div className="space-y-3 rounded-md border border-[#E8E8E8] bg-[#F9FAFD] px-4 py-4 sm:px-5">
                  <div>
                    <Typography
                      variant="label"
                      className="text-[13px] font-bold tracking-wide text-[#1F1838]"
                    >
                      Documents &amp; photos
                    </Typography>
                    <Typography
                      variant="body-sm"
                      className="mt-1 text-[#6B7890]"
                    >
                      Preview shows what is saved on your account. Upload only
                      when you need to replace a file.
                    </Typography>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <ImagePicker
                      control={driverForm.control}
                      name="profile_image"
                      label="Driver's image"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      variant="profile-document"
                      existingImageUrl={toPublicFileUrl(
                        driver?.profile_image ?? null,
                      )}
                      helperText="JPG, PNG, GIF"
                      itemClassName="gap-2"
                    />
                    <ImagePicker
                      control={driverForm.control}
                      name="cnic_image"
                      label="Driver's CNIC"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      variant="profile-document"
                      existingImageUrl={toPublicFileUrl(
                        driver?.cnic_image ?? null,
                      )}
                      helperText="JPG, PNG, GIF"
                      itemClassName="gap-2"
                    />
                    <ImagePicker
                      control={driverForm.control}
                      name="license_image"
                      label="Driver's license"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      variant="profile-document"
                      existingImageUrl={toPublicFileUrl(
                        driver?.license_image ?? null,
                      )}
                      helperText="JPG, PNG, GIF"
                      itemClassName="gap-2 sm:col-span-2 lg:col-span-1"
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="destructive-outline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCancel();
                    }}
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    Save profile
                  </Button>
                </div>
              </FormCommon>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
