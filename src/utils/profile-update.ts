import type { LoginUser, UpdateProfilePayload } from "@/api/types/auth";
import { toDateOnlyInputValue } from "@/utils/helpers";
import type { ProfileUpdateValues } from "@/utils/zodSchema";

function normText(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value).trim();
}

/** Normalize API ISO dates and form values to `YYYY-MM-DD` for comparison. */
export function normDateForProfile(value: string | null | undefined): string {
  if (!value) return "";
  const fromIso = toDateOnlyInputValue(value);
  if (fromIso) return fromIso;
  return value.trim();
}

/** Profile photos/documents; each must be saved on the account or uploaded. */
export const PROFILE_IMAGE_FIELDS = [
  { key: "profile_image", label: "Driver's image" },
  { key: "cnic_front_image", label: "CNIC (front)" },
  { key: "cnic_back_image", label: "CNIC (back)" },
  { key: "license_front_image", label: "Driving license (front)" },
  { key: "license_back_image", label: "Driving license (back)" },
] as const;

export type ProfileImageField = (typeof PROFILE_IMAGE_FIELDS)[number]["key"];

function setTextIfChanged(
  payload: UpdateProfilePayload,
  key: keyof Omit<UpdateProfilePayload, ProfileImageField>,
  next: string,
  prev: string,
) {
  if (next !== prev) {
    payload[key] = next;
  }
}

/**
 * Build a partial PUT /auth/me body: only changed text fields and new file uploads.
 */
export function buildUpdateProfilePayload(
  values: ProfileUpdateValues,
  previous: LoginUser | null,
): UpdateProfilePayload {
  const payload: UpdateProfilePayload = {};

  const next = {
    name: values.name.trim(),
    gender: values.gender.trim(),
    age: values.age.trim(),
    address: values.address.trim(),
    // location: values.location.trim(),
    contact_number: values.contact_number.trim(),
    license_number: values.license_number.trim(),
    license_expiry: normDateForProfile(values.license_expiry),
    cnic: values.cnic.trim(),
    date_of_birth: normDateForProfile(values.date_of_birth),
    occupation: values.occupation.trim(),
  };

  if (!previous) {
    Object.assign(payload, next);
  } else {
    setTextIfChanged(payload, "name", next.name, normText(previous.name));
    setTextIfChanged(payload, "gender", next.gender, normText(previous.gender));
    setTextIfChanged(payload, "age", next.age, normText(previous.age));
    setTextIfChanged(payload, "address", next.address, normText(previous.address));
    // setTextIfChanged(
    //   payload,
    //   "location",
    //   next.location,
    //   normText(previous.location),
    // );
    setTextIfChanged(
      payload,
      "contact_number",
      next.contact_number,
      normText(previous.contact_number),
    );
    setTextIfChanged(
      payload,
      "license_number",
      next.license_number,
      normText(previous.license_number),
    );
    setTextIfChanged(
      payload,
      "license_expiry",
      next.license_expiry,
      normDateForProfile(previous.license_expiry),
    );
    setTextIfChanged(payload, "cnic", next.cnic, normText(previous.cnic));
    setTextIfChanged(
      payload,
      "date_of_birth",
      next.date_of_birth,
      normDateForProfile(previous.date_of_birth),
    );
    setTextIfChanged(
      payload,
      "occupation",
      next.occupation,
      normText(previous.occupation),
    );
  }

  for (const { key } of PROFILE_IMAGE_FIELDS) {
    const file = values[key];
    if (file instanceof File) {
      payload[key] = file;
    }
  }

  return payload;
}

export function appendUpdateProfileToFormData(
  formData: FormData,
  payload: UpdateProfilePayload,
): void {
  const textKeys = [
    "name",
    "contact_number",
    "gender",
    "age",
    "address",
    "location",
    "cnic",
    "license_number",
    "license_expiry",
    "date_of_birth",
    "occupation",
  ] as const;

  for (const key of textKeys) {
    const value = payload[key];
    if (value !== undefined && value !== "") {
      formData.append(key, value);
    }
  }

  for (const { key } of PROFILE_IMAGE_FIELDS) {
    const file = payload[key];
    if (file instanceof File) {
      formData.append(key, file);
    }
  }
}

export function hasUpdateProfileChanges(payload: UpdateProfilePayload): boolean {
  const textKeys = [
    "name",
    "contact_number",
    "gender",
    "age",
    "address",
    "location",
    "cnic",
    "license_number",
    "license_expiry",
    "date_of_birth",
    "occupation",
  ] as const;

  if (textKeys.some((k) => payload[k] !== undefined)) {
    return true;
  }
  return PROFILE_IMAGE_FIELDS.some(({ key }) => payload[key] instanceof File);
}

/** Labels of required images that are neither saved nor newly selected. */
export function getMissingProfileImages(
  values: Pick<ProfileUpdateValues, ProfileImageField>,
  previous: Partial<Record<ProfileImageField, string | null>> | null,
): { key: ProfileImageField; label: string }[] {
  return PROFILE_IMAGE_FIELDS.filter(({ key }) => {
    if (values[key] instanceof File) return false;
    return !normText(previous?.[key]);
  });
}
