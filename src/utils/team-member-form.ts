import { z } from "zod";

import type {
  CreateTeamMemberPayload,
  TeamMember,
  UpdateTeamMemberPayload,
} from "@/api/types/team-members";
import { toDateOnlyInputValue } from "@/utils/helpers";

export const teamMemberFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  contact_number: z.string().trim().min(1, "Contact number is required"),
  cnic: z.string().trim().min(1, "CNIC is required"),
  date_of_birth: z.string().trim().min(1, "Date of birth is required"),
  occupation: z.string().optional(),
  location: z.string().optional(),
  profile_image: z.union([z.instanceof(File), z.string(), z.null()]),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

export const emptyTeamMemberFormValues: TeamMemberFormValues = {
  name: "",
  email: "",
  contact_number: "",
  cnic: "",
  date_of_birth: "",
  occupation: "",
  location: "",
  profile_image: null,
};

export function teamMemberToFormValues(m: TeamMember): TeamMemberFormValues {
  return {
    name: m.name,
    email: m.email,
    contact_number: m.contact_number,
    cnic: m.cnic,
    date_of_birth: toDateOnlyInputValue(m.date_of_birth) || m.date_of_birth || "",
    occupation: m.occupation ?? "",
    location: m.location ?? "",
    profile_image: m.profile_image ?? null,
  };
}

function optionalTrimmed(s: string | undefined): string | undefined {
  const t = (s ?? "").trim();
  return t === "" ? undefined : t;
}

export function buildCreateTeamMemberPayload(
  values: TeamMemberFormValues,
): CreateTeamMemberPayload {
  const payload: CreateTeamMemberPayload = {
    name: values.name.trim(),
    email: values.email.trim(),
    contact_number: values.contact_number.trim(),
    cnic: values.cnic.trim(),
    date_of_birth: values.date_of_birth.trim(),
  };
  const occupation = optionalTrimmed(values.occupation);
  const location = optionalTrimmed(values.location);
  if (occupation) payload.occupation = occupation;
  if (location) payload.location = location;
  if (values.profile_image instanceof File) {
    payload.profile_image = values.profile_image;
  }
  return payload;
}

export function buildUpdateTeamMemberPayload(
  values: TeamMemberFormValues,
): UpdateTeamMemberPayload {
  const payload: UpdateTeamMemberPayload = {
    name: values.name.trim(),
    email: values.email.trim(),
    contact_number: values.contact_number.trim(),
    cnic: values.cnic.trim(),
    date_of_birth: values.date_of_birth.trim(),
  };
  const occupation = optionalTrimmed(values.occupation);
  const location = optionalTrimmed(values.location);
  if (occupation !== undefined) payload.occupation = occupation;
  if (location !== undefined) payload.location = location;
  if (values.profile_image instanceof File) {
    payload.profile_image = values.profile_image;
  }
  return payload;
}
