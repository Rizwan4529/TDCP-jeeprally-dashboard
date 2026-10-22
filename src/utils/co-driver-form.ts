import { z } from "zod";

import type { CreateTeamPayload } from "../api/types/teams";
import { PROFILE_IMAGE_FIELDS } from "./profile-update";
import type { TeamFormValues } from "./team-form";

const requiredString = (message = "This field is required") =>
  z.string().trim().min(1, message);

/** Occupation is no longer asked for; every co-driver is saved as this. */
export const CO_DRIVER_OCCUPATION = "Co-driver";

/** Document fields for the co-driver form, labelled for the co-driver. */
export const CO_DRIVER_IMAGE_FIELDS = [
  { key: "profile_image", label: "Co-driver's image" },
  { key: "cnic_front_image", label: "Co-driver's CNIC (front)" },
  { key: "cnic_back_image", label: "Co-driver's CNIC (back)" },
  { key: "license_front_image", label: "Co-driver's license (front)" },
  { key: "license_back_image", label: "Co-driver's license (back)" },
] as const satisfies ReadonlyArray<{
  key: (typeof PROFILE_IMAGE_FIELDS)[number]["key"];
  label: string;
}>;

const optionalImage = z.union([z.instanceof(File), z.null()]).optional();

const dateOfBirthSchema = z
  .string()
  .trim()
  .min(1, "Date of birth is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date")
  .refine((dateStr) => {
    const parsed = new Date(`${dateStr}T00:00:00`);
    return !Number.isNaN(parsed.getTime());
  }, "Invalid date")
  .refine((dateStr) => {
    const parsed = new Date(`${dateStr}T00:00:00`);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return parsed <= endOfToday;
  }, "Date of birth cannot be in the future");

const licenseExpirySchema = z
  .string()
  .trim()
  .min(1, "License expiry is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date")
  .refine((dateStr) => {
    const parsed = new Date(`${dateStr}T00:00:00`);
    return !Number.isNaN(parsed.getTime());
  }, "Invalid date")
  .refine((dateStr) => {
    const parsed = new Date(`${dateStr}T00:00:00`);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return parsed >= startOfToday;
  }, "License expiry must be today or a future date");

/** Co-driver profile fields (same as driver profile; images optional per API). */
export const coDriverFormSchema = z.object({
  name: requiredString("Enter full name"),
  email: z.string().trim().email("Enter a valid email address"),
  gender: requiredString("Select gender"),
  age: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Enter a valid age"),
  address: requiredString("Enter address"),
  contact_number: z
    .string()
    .trim()
    .regex(/^03\d{9}$/, "Enter a valid mobile number (e.g. 03001234567)"),
  license_number: requiredString("Enter license number"),
  license_expiry: licenseExpirySchema,
  cnic: z
    .string()
    .trim()
    .regex(/^\d{13}$/, "CNIC must be exactly 13 digits"),
  date_of_birth: dateOfBirthSchema,
  // occupation: requiredString("Enter occupation"),
  occupation: z.string().trim(),
  profile_image: optionalImage,
  cnic_front_image: optionalImage,
  cnic_back_image: optionalImage,
  license_front_image: optionalImage,
  license_back_image: optionalImage,
});

export type CoDriverFormValues = z.infer<typeof coDriverFormSchema>;

export const emptyCoDriverFormValues: CoDriverFormValues = {
  name: "",
  email: "",
  gender: "",
  age: "",
  address: "",
  contact_number: "",
  license_number: "",
  license_expiry: "",
  cnic: "",
  date_of_birth: "",
  occupation: CO_DRIVER_OCCUPATION,
  profile_image: null,
  cnic_front_image: null,
  cnic_back_image: null,
  license_front_image: null,
  license_back_image: null,
};

export type CoDriverTextFields = {
  name: string;
  email: string;
  contact_number: string;
  cnic: string;
  gender: string;
  age: string;
  address: string;
  license_number: string;
  license_expiry: string;
  date_of_birth: string;
  occupation: string;
};

function toCoDriverTextFields(values: CoDriverFormValues): CoDriverTextFields {
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    contact_number: values.contact_number.trim(),
    cnic: values.cnic.trim(),
    gender: values.gender.trim(),
    age: values.age.trim(),
    address: values.address.trim(),
    license_number: values.license_number.trim(),
    license_expiry: values.license_expiry.trim(),
    date_of_birth: values.date_of_birth.trim(),
    // occupation: values.occupation.trim(),
    occupation: CO_DRIVER_OCCUPATION,
  };
}

function appendCoDriverImages(formData: FormData, values: CoDriverFormValues) {
  for (const { key } of PROFILE_IMAGE_FIELDS) {
    const file = values[key];
    if (file instanceof File) {
      formData.append(key, file);
    }
  }
}

function hasCoDriverImages(values: CoDriverFormValues): boolean {
  return PROFILE_IMAGE_FIELDS.some(({ key }) => values[key] instanceof File);
}

/** Team details for create, shared with the co-driver step. */
export function teamDetailsForCreate(
  values: TeamFormValues,
  eventId: string | undefined,
): CreateTeamPayload {
  const payload: CreateTeamPayload = {
    team_name: values.team_name.trim(),
    // team_number: values.team_number.trim(),
    category: values.category,
  };
  const type = values.type?.trim();
  if (type) payload.type = type;
  if (eventId) payload.event_id = eventId;
  return payload;
}

/**
 * Create-team body with nested `co_driver`. Uses multipart when images are
 * attached (backend merges top-level files into `co_driver`).
 */
export function buildCreateTeamWithCoDriverBody(
  team: CreateTeamPayload,
  coDriver: CoDriverFormValues,
): CreateTeamPayload | FormData {
  const text = toCoDriverTextFields(coDriver);
  if (!hasCoDriverImages(coDriver)) {
    return { ...team, co_driver: text };
  }

  const formData = new FormData();
  formData.append("team_name", team.team_name);
  // formData.append("team_number", team.team_number);
  formData.append("category", String(team.category));
  if (team.type) formData.append("type", team.type);
  if (team.event_id) formData.append("event_id", team.event_id);
  if (Array.isArray(team.member_ids) && team.member_ids.length > 0) {
    formData.append("member_ids", JSON.stringify(team.member_ids));
  }
  formData.append("co_driver", JSON.stringify(text));
  appendCoDriverImages(formData, coDriver);
  return formData;
}

/** Add co-driver later: flat fields (+ optional images) for POST …/co-drivers. */
export function buildAddCoDriverBody(
  coDriver: CoDriverFormValues,
): Record<string, string> | FormData {
  const text = toCoDriverTextFields(coDriver);
  if (!hasCoDriverImages(coDriver)) {
    return text;
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(text)) {
    formData.append(key, value);
  }
  appendCoDriverImages(formData, coDriver);
  return formData;
}
