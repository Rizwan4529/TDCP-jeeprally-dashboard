import * as React from "react";
import { Link } from "react-router-dom";
import { CameraIcon, DotIcon, PencilIcon } from "lucide-react";

import { PageHeader } from "@/components/common/NavigationCommon";
import { Typography } from "@/components/common/Typography";
import {
  SCROLL_PAGE,
  SIDEBAR_PAGE_PADDING,
} from "@/components/layout/pageLayout";
import { OtherRacesSection } from "@/components/profile/OtherRacesSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSessionUser } from "@/hooks/api/use-session-user";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants";
import { toDateOnlyInputValue, toPublicFileUrl } from "@/utils/helpers";
import { sessionToProfileDriver } from "@/utils/profile-driver";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

export default function ProfilePage() {
  return <ProfileScreen />;
}

function ProfileScreen() {
  const { data: sessionUser } = useSessionUser();
  const driver = React.useMemo(
    () => (sessionUser ? sessionToProfileDriver(sessionUser) : null),
    [sessionUser],
  );

  const initials = (driver?.name ?? "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className={cn(SCROLL_PAGE, SIDEBAR_PAGE_PADDING)}>
      <div className="space-y-6 pb-6">
        <PageHeader
          title="Profile"
          actions={
            <Button asChild>
              <Link to={ROUTES.PROFILE_EDIT}>
                <PencilIcon className="size-4" />
                Edit profile
              </Link>
            </Button>
          }
        />

        <Card className={cn(surface, "rounded-md px-6 py-6")}>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="size-[108px] overflow-hidden rounded-full border-2 border-primary bg-primary/10">
                  {toPublicFileUrl(driver?.profile_image ?? null) ? (
                    <img
                      src={toPublicFileUrl(driver?.profile_image ?? null) ?? ""}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[28px] font-semibold text-primary">
                      {initials}
                    </div>
                  )}
                </div>
                <Button
                  asChild
                  size="icon"
                  className="absolute bottom-1 right-1 size-10 rounded-full bg-primary text-white shadow-[0_10px_20px_rgba(16,24,40,0.18)] ring-2 ring-white hover:bg-primary-dark"
                  aria-label="Change photo"
                >
                  <Link to={ROUTES.PROFILE_EDIT}>
                    <CameraIcon className="size-5" />
                  </Link>
                </Button>
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
          </div>
        </Card>

        <Card className={cn(surface, "rounded-md")}>
          <div className="border-b border-[#E8E8E8] px-6 py-5">
            <Typography
              as="h3"
              variant="label"
              className="text-[14px] font-bold tracking-wide text-[#1F1838]"
            >
              DRIVER INFORMATION
            </Typography>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
              <Field label="Full Name" value={driver?.name ?? "—"} />
              <Field label="Email" value={driver?.email ?? "—"} />
              <Field
                label="Phone Number"
                value={driver?.contact_number ?? "—"}
              />
              <Field label="Address" value={driver?.address ?? "—"} />
              {/* <Field label="Location" value={driver?.location ?? "—"} /> */}
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
          </div>
        </Card>

        <Card className={cn(surface, "rounded-md")}>
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

        <OtherRacesSection />
      </div>
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
        className="h-11 rounded-md border-[#E8E8E8] bg-[#FBFBFD] text-[14px] text-[#1F1838] shadow-none"
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
      ? "bg-primary text-white"
      : "bg-[#2F2F31] text-white";

  return (
    <div className="overflow-hidden rounded-md border border-[#EDEEF4]">
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
