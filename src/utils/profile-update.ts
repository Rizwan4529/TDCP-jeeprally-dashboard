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

function setTextIfChanged(
  payload: UpdateProfilePayload,
  key: keyof Omit<
    UpdateProfilePayload,
    "profile_image" | "cnic_image" | "license_image"
  >,
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
    location: values.location.trim(),
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
    setTextIfChanged(
      payload,
      "location",
      next.location,
      normText(previous.location),
    );
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

  if (values.profile_image instanceof File) {
    payload.profile_image = values.profile_image;
  }
  if (values.cnic_image instanceof File) {
    payload.cnic_image = values.cnic_image;
  }
  if (values.license_image instanceof File) {
    payload.license_image = values.license_image;
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

  if (payload.profile_image instanceof File) {
    formData.append("profile_image", payload.profile_image);
  }
  if (payload.cnic_image instanceof File) {
    formData.append("cnic_image", payload.cnic_image);
  }
  if (payload.license_image instanceof File) {
    formData.append("license_image", payload.license_image);
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
  return (
    payload.profile_image instanceof File ||
    payload.cnic_image instanceof File ||
    payload.license_image instanceof File
  );
}
