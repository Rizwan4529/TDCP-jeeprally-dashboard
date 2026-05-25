import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { CameraIcon, DotIcon, PencilIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  DatePicker,
  FormCommon,
  ImagePicker,
  Input as FormInput,
  Select,
  Textarea,
} from "@/components/common/FormCommon";
import { useUpdateProfileMutation } from "@/hooks/api/use-update-profile";
import { useSessionUser } from "@/hooks/api/use-session-user";
import { GENDER_OPTIONS } from "@/utils/constants";
import { sessionToProfileDriver } from "@/utils/profile-driver";
import { toDateOnlyInputValue, toPublicFileUrl } from "@/utils/helpers";
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
  "h-11 w-full rounded-[10px] border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838]";

const rankingData = [
  { label: "1", green: 34, yellow: 41 },
  { label: "2", green: 45, yellow: 56 },
  { label: "3", green: 42, yellow: 47 },
  { label: "4", green: 44, yellow: 49 },
  { label: "5", green: 49, yellow: 52 },
  { label: "6", green: 52, yellow: 33 },
  { label: "7", green: 47, yellow: 46 },
  { label: "8", green: 55, yellow: 42 },
  { label: "9", green: 67, yellow: 48 },
  { label: "10", green: 58, yellow: 63 },
  { label: "11", green: 66, yellow: 35 },
];

export default function ProfilePage() {
  return <ProfileScreen />;
}

function ProfileScreen() {
  const { data: sessionUser } = useSessionUser();
  const driver = React.useMemo(
    () => (sessionUser ? sessionToProfileDriver(sessionUser) : null),
    [sessionUser],
  );

  const updateProfileMutation = useUpdateProfileMutation();
  const [driverMode, setDriverMode] = React.useState<"view" | "edit">("view");

  const driverForm = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: profileFormDefaults,
    values:
      driverMode === "edit" && driver
        ? {
            name: driver.name,
            gender: driver.gender ?? "",
            age:
              driver.age != null && String(driver.age).trim() !== ""
                ? String(driver.age)
                : "",
            address: driver.address ?? driver.location ?? "",
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
    try {
      await updateProfileMutation.mutateAsync({
        name: values.name,
        gender: values.gender,
        age: values.age,
        address: values.address,
        contact_number: values.contact_number,
        license_number: values.license_number,
        license_expiry: values.license_expiry,
        cnic: values.cnic,
        date_of_birth: values.date_of_birth,
        occupation: values.occupation,
        profile_image: values.profile_image,
        cnic_image: values.cnic_image,
        license_image: values.license_image,
      });
      toast.success("Profile updated.");
      setDriverMode("view");
    } catch {
      toast.error("Could not update profile. Please try again.");
    }
  };

  const initials = (driver?.name ?? "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="space-y-6">
      <Card className={cn(surface, "rounded-[14px] px-6 py-6")}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="size-[108px] overflow-hidden rounded-full border-2 border-[#3FA565] bg-[#EAF6EF]">
                {toPublicFileUrl(driver?.profile_image ?? null) ? (
                  <img
                    src={toPublicFileUrl(driver?.profile_image ?? null) ?? ""}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[28px] font-semibold text-[#00571C]">
                    {initials}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-1 right-1 flex size-10 items-center justify-center rounded-full bg-[#3FA565] text-white shadow-[0_10px_20px_rgba(16,24,40,0.18)] ring-2 ring-white"
                aria-label="Change photo"
                onClick={() => {
                  if (driver) setDriverMode("edit");
                }}
              >
                <CameraIcon className="size-5" />
              </button>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Typography
                  as="h2"
                  variant="h4"
                  className="text-[28px] font-semibold leading-none text-[#1F1838]"
                >
                  {driver?.name ?? "—"}
                </Typography>
                <span className="inline-flex items-center rounded-full border border-[#F3D7A0] bg-[#FFF6E3] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#B7791F]">
                  {driver?.occupation ?? "DRIVER"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-[#6B7890]">
                <span className="inline-flex items-center gap-2">
                  <DotIcon className="size-5 text-[#6B7890]" />
                  {driver?.email ?? "—"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <DotIcon className="size-5 text-[#6B7890]" />
                  {driver?.contact_number ?? "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="h-11 rounded-[10px] bg-[#3FA565] px-5 text-[14px] font-semibold hover:bg-[#369A5D]"
              onClick={() => {
                if (driver) {
                  setDriverMode("edit");
                } else {
                  toast.error("No driver profile loaded yet.");
                }
              }}
            >
              <PencilIcon className="size-4" />
              Edit Info
            </Button>
          </div>
        </div>
      </Card>

      <Card className={cn(surface, "rounded-[14px]")}>
        <div className="border-b border-[#E8E8E8] px-6 py-5">
          <Typography
            as="h3"
            variant="label"
            className="text-[14px] font-bold tracking-wide text-[#1F1838]"
          >
            DRIVER INFORMATION
          </Typography>
        </div>

        {driver && driverMode === "edit" ? (
          <div className="px-6 py-6">
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
                  className={profileFieldClassName}
                />
                <Select
                  control={driverForm.control}
                  name="gender"
                  label="Gender"
                  placeholder="Select gender"
                  options={genderSelectOptions}
                  className={profileFieldClassName}
                />
                <FormInput
                  control={driverForm.control}
                  name="age"
                  label="Age"
                  inputMode="numeric"
                  maxLength={3}
                  className={profileFieldClassName}
                />
                <FormInput
                  control={driverForm.control}
                  name="occupation"
                  label="Occupation"
                  className={profileFieldClassName}
                />
              </div>
              <Textarea
                control={driverForm.control}
                name="address"
                label="Address"
                rows={3}
                className={profileFieldClassName}
              />
              <div className="grid gap-5 md:grid-cols-2">
                <FormInput
                  control={driverForm.control}
                  name="contact_number"
                  label="Contact number"
                  inputMode="numeric"
                  maxLength={11}
                  className={profileFieldClassName}
                />
                <FormInput
                  control={driverForm.control}
                  name="license_number"
                  label="License number"
                  className={profileFieldClassName}
                />
                <DatePicker
                  control={driverForm.control}
                  name="license_expiry"
                  label="License expiry"
                  placeholder="YYYY-MM-DD"
                  calendarYearsFuture={50}
                  className={profileFieldClassName}
                />
                <FormInput
                  control={driverForm.control}
                  name="cnic"
                  label="CNIC"
                  inputMode="numeric"
                  maxLength={13}
                  className={profileFieldClassName}
                />
                <DatePicker
                  control={driverForm.control}
                  name="date_of_birth"
                  label="Date of birth"
                  placeholder="YYYY-MM-DD"
                  className={profileFieldClassName}
                />
              </div>
              <Typography variant="caption" className="text-[#6B7890]">
                Upload new images only if you want to replace the existing ones
                on file.
              </Typography>
              <div className="grid gap-5 sm:grid-cols-3">
                <ImagePicker
                  control={driverForm.control}
                  name="profile_image"
                  label="Profile photo"
                  accept="image/*"
                  variant="compact"
                />
                <ImagePicker
                  control={driverForm.control}
                  name="cnic_image"
                  label="CNIC image"
                  accept="image/*"
                  variant="compact"
                />
                <ImagePicker
                  control={driverForm.control}
                  name="license_image"
                  label="License image"
                  accept="image/*"
                  variant="compact"
                />
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="primary-outline"
                  onClick={(e) => {
                    e.preventDefault();
                    setDriverMode("view");
                    driverForm.reset(profileFormDefaults);
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
          </div>
        ) : (
          <div className="space-y-6 px-6 py-6">
            <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
              <Field label="Full Name" value={driver?.name ?? "—"} />
              <Field label="Email" value={driver?.email ?? "—"} />
              <Field
                label="Phone Number"
                value={driver?.contact_number ?? "—"}
              />
              <Field
                label="Address"
                value={driver?.address ?? driver?.location ?? "—"}
              />
              <Field label="Gender" value={driver?.gender ?? "—"} />
              <Field
                label="Age"
                value={
                  driver?.age != null && String(driver.age).trim() !== ""
                    ? String(driver.age)
                    : "—"
                }
              />
              <Field label="CNIC" value={driver?.cnic ?? "—"} />
              <Field
                label="Date of birth"
                value={
                  toDateOnlyInputValue(driver?.date_of_birth) ||
                  driver?.date_of_birth ||
                  "—"
                }
              />
              <Field
                label="License number"
                value={driver?.license_number ?? "—"}
              />
              <Field
                label="License expiry"
                value={
                  toDateOnlyInputValue(driver?.license_expiry) ||
                  driver?.license_expiry ||
                  "—"
                }
              />
              <Field label="Occupation" value={driver?.occupation ?? "—"} />
            </div>
            {driver ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="primary-outline"
                  onClick={() => setDriverMode("edit")}
                >
                  <PencilIcon className="size-4" />
                  Edit driver profile
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Card>

      <Card className={cn(surface, "rounded-[14px]")}>
        <SectionTitle>TEAM STANDING</SectionTitle>
        <div className="px-6 pb-6">
          <DataTable
            headerVariant="green"
            rows={[
              [
                "Red bull gas factory race",
                "1 stage",
                "Nissan Juke",
                "2024",
                "Driver",
              ],
              [
                "Red bull gas factory race",
                "1 stage",
                "Dirt bike",
                "2023",
                "Navigator",
              ],
              ["Red bull gas factory race", "1 stage", "Revo", "2024", "Role"],
            ]}
          />
        </div>
      </Card>

      <Card className={cn(surface, "rounded-[14px]")}>
        <SectionTitle>OTHER RACES</SectionTitle>
        <div className="px-6 pb-6">
          <DataTable
            headerVariant="dark"
            rows={[
              [
                "Red bull gas factory race",
                "1 stage",
                "Nissan Juke",
                "2024",
                "Driver",
              ],
              [
                "Red bull gas factory race",
                "1 stage",
                "Dirt bike",
                "2023",
                "Navigator",
              ],
              ["Red bull gas factory race", "1 stage", "Revo", "2024", "Role"],
            ]}
          />
        </div>
      </Card>

      <Card className={cn(surface, "rounded-[14px]")}>
        <SectionTitle>RANKING</SectionTitle>
        <div className="px-6 pb-6">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={rankingData}
                margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
              >
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9AA6C8", fontSize: 12 }}
                />
                <YAxis hide domain={[0, 80]} />
                <Line
                  type="monotone"
                  dataKey="yellow"
                  stroke="#F4B400"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: "#F4B400", strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="green"
                  stroke="#3FA565"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: "#3FA565", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 pt-6">
      <Typography
        as="h3"
        variant="label"
        className="text-[14px] font-bold tracking-wide text-[#1F1838]"
      >
        {children}
      </Typography>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Typography as="p" variant="caption" className="text-[#6B7890]">
        {label}
      </Typography>
      <Input
        value={value}
        readOnly
        className="h-11 rounded-[10px] border-[#E8E8E8] bg-[#FBFBFD] text-[14px] text-[#1F1838] shadow-none"
      />
    </div>
  );
}

function DataTable({
  headerVariant,
  rows,
}: {
  headerVariant: "green" | "dark";
  rows: Array<[string, string, string, string, string]>;
}) {
  const headerClass =
    headerVariant === "green"
      ? "bg-[#3FA565] text-white"
      : "bg-[#2F2F31] text-white";

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#EDEEF4]">
      <div
        className={cn(
          "grid grid-cols-[1.55fr_0.75fr_1fr_0.6fr_0.7fr] px-5 py-3",
          headerClass,
        )}
      >
        {["Team", "Position", "Vehicle", "year", "Role"].map((h) => (
          <p
            key={h}
            className="text-[12px] font-semibold uppercase tracking-wide"
          >
            {h}
          </p>
        ))}
      </div>
      <div className="divide-y divide-[#EEF0F7] bg-white">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.55fr_0.75fr_1fr_0.6fr_0.7fr] items-center px-5 py-4 text-[13px]"
          >
            <p className="font-medium text-[#1F1838]">{row[0]}</p>
            <p className="text-[#6B7890]">{row[1]}</p>
            <p className="text-[#6B7890]">{row[2]}</p>
            <p className="font-semibold text-[#1F1838]">{row[3]}</p>
            <p className="text-[#6B7890]">{row[4]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
