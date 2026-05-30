import { z } from "zod";

import type { OtherRace, OtherRaceRole } from "@/api/types/other-races";

export const OTHER_RACE_ROLE_OPTIONS = [
  { label: "Driver", value: "driver" as const },
  { label: "Navigator", value: "navigator" as const },
];

export const otherRaceFormSchema = z.object({
  team: z.string().trim().min(1, "Team / race name is required"),
  position: z.string().trim().min(1, "Position is required"),
  vehicle: z.string().trim().min(1, "Vehicle is required"),
  year: z
    .string()
    .trim()
    .min(1, "Year is required")
    .regex(/^\d{4}$/, "Enter a valid 4-digit year")
    .refine((v) => {
      const n = Number.parseInt(v, 10);
      return n >= 1900 && n <= 2100;
    }, "Year must be between 1900 and 2100"),
  role: z.enum(["driver", "navigator"], {
    message: "Select a role",
  }),
});

export type OtherRaceFormValues = z.infer<typeof otherRaceFormSchema>;

export const emptyOtherRaceFormValues: OtherRaceFormValues = {
  team: "",
  position: "",
  vehicle: "",
  year: String(new Date().getFullYear()),
  role: "driver",
};

export function otherRaceToFormValues(entry: OtherRace): OtherRaceFormValues {
  return {
    team: entry.team,
    position: entry.position,
    vehicle: entry.vehicle,
    year: String(entry.year),
    role: entry.role,
  };
}

export function buildCreateOtherRacePayload(values: OtherRaceFormValues) {
  return {
    team: values.team.trim(),
    position: values.position.trim(),
    vehicle: values.vehicle.trim(),
    year: Number.parseInt(values.year, 10),
    role: values.role as OtherRaceRole,
  };
}

export function buildUpdateOtherRacePayload(
  values: OtherRaceFormValues,
  previous: OtherRace,
) {
  const next = buildCreateOtherRacePayload(values);
  const payload: Partial<typeof next> = {};

  if (next.team !== previous.team) payload.team = next.team;
  if (next.position !== previous.position) payload.position = next.position;
  if (next.vehicle !== previous.vehicle) payload.vehicle = next.vehicle;
  if (next.year !== previous.year) payload.year = next.year;
  if (next.role !== previous.role) payload.role = next.role;

  return payload;
}

export function formatOtherRaceRole(role: OtherRaceRole): string {
  return role === "navigator" ? "Navigator" : "Driver";
}

export function hasUpdateOtherRaceChanges(
  payload: ReturnType<typeof buildUpdateOtherRacePayload>,
): boolean {
  return Object.keys(payload).length > 0;
}
