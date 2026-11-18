/**
 * Phone helpers — same rules as tdcp-booking-portal/src/utils/phoneValidation.js and the
 * mobile app. Form state holds E.164 ("+923001234567"); legacy numbers such as
 * "03001234567" are accepted and normalised the same way.
 */
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import { z } from "zod";

const DEFAULT_COUNTRY: CountryCode = "PK";

/** "", the old "03" prefill and a bare dial code all count as empty. */
export function isPhoneValueEmpty(value?: string | null): boolean {
  if (value == null) return true;
  const str = String(value).trim();
  return str === "" || str === "03" || str === "+" || str === "+92";
}

/** E.164 from any typed / stored value, or "" when it can't be parsed. */
export function normalizeStoredPhone(value?: string | null): string {
  if (isPhoneValueEmpty(value)) return "";
  const str = String(value).trim();
  const digits = str.replace(/\D/g, "");
  // "923001234567" without the plus is how some profiles store it.
  const candidate =
    !str.startsWith("+") && digits.startsWith("92") && digits.length > 10
      ? `+${digits}`
      : str;
  return parsePhoneNumberFromString(candidate, DEFAULT_COUNTRY)?.number ?? "";
}

export function isValidStoredPhone(value?: string | null): boolean {
  const e164 = normalizeStoredPhone(value);
  return !!e164 && isValidPhoneNumber(e164);
}

/** react-phone-input-2 gives digits incl. dial code ("923001234567") → E.164. */
export function toStoredPhone(digits?: string | null): string {
  const clean = String(digits ?? "").replace(/\D/g, "");
  return clean ? `+${clean}` : "";
}

/** Digits-only value for react-phone-input-2 from a stored value. */
export function toPhoneInputDigits(value?: string | null): string {
  const e164 = normalizeStoredPhone(value);
  return e164 ? e164.slice(1) : "";
}

/**
 * The Jeep Rally backend stores Pakistani numbers as "03XXXXXXXXX"; every other country
 * stays E.164. Convert form values with this when building an API payload.
 */
export function toJeepRallyPhone(value?: string | null): string {
  if (isPhoneValueEmpty(value)) return "";
  const e164 = normalizeStoredPhone(value);
  if (!e164) return String(value ?? "").trim();
  const parsed = parsePhoneNumberFromString(e164);
  if (parsed?.country === "PK") return `0${parsed.nationalNumber}`;
  return e164;
}

export const INVALID_PHONE_MESSAGE =
  "Enter a valid phone number for the selected country";

export const phoneRequiredSchema = (message = "Phone number is required") =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => isPhoneValueEmpty(value) || isValidStoredPhone(value), {
      message: INVALID_PHONE_MESSAGE,
    })
    .refine((value) => !isPhoneValueEmpty(value), { message });
