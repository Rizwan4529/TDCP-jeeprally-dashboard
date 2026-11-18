import { z } from "zod";

/** A CNIC is exactly 13 digits — no dashes, no more, no less. */
export const CNIC_LENGTH = 13;

/** Keep only digits and stop at 13, for use in `onChange` of every CNIC input. */
export function sanitizeCnic(value: string): string {
  return value.replace(/\D/g, "").slice(0, CNIC_LENGTH);
}

export function isValidCnic(value?: string | null): boolean {
  return /^\d{13}$/.test(String(value ?? "").trim());
}

export const CNIC_MESSAGE = "CNIC must be exactly 13 digits";

export const cnicSchema = z
  .string()
  .trim()
  .min(1, "CNIC is required")
  .regex(/^\d{13}$/, CNIC_MESSAGE);
