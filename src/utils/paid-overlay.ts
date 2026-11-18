import type { DriverRegistration } from "@/api/types/registrations";

/**
 * Payment details from the confirm-booking response, keyed by registration id.
 *
 * The Jeep Rally registration can still read `unpaid` / `pending` (no transaction id or paid
 * date) right after a successful payment, while confirm-booking already reports the captured
 * payment. We keep those details for the browser session (sessionStorage, so a refresh keeps
 * them) and lay them over the registration for display.
 */
type PaidDetails = {
  transaction_id: string | null;
  paid_at: string | null;
  amount: number | null;
  currency: string | null;
  order_id: string | null;
  /** Registration status reported by confirm-booking (e.g. "paid"). */
  status: string | null;
};

const STORAGE_KEY = "jr-paid-overlay";

function readAll(): Record<string, PaidDetails> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PaidDetails>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, PaidDetails>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable: the overlay is a best-effort display aid */
  }
}

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

/** Remember the payment from a confirm-booking `data` payload; no-op unless it is a success. */
export function rememberPaidFromConfirm(
  registrationId: string | undefined,
  data: unknown,
): void {
  if (!registrationId) return;
  const root = asRecord(data);
  const details = asRecord(root?.paymentDetails);
  if (!root || !details) return;
  const paid =
    String(details.paymentStatus ?? "").toUpperCase() === "SUCCESS" ||
    String(root.status ?? "").toLowerCase() === "paid";
  if (!paid) return;
  const amount = Number(details.amount ?? root.totalAmount);
  const all = readAll();
  all[registrationId] = {
    transaction_id: str(details.transaction_id),
    // confirm-booking has no explicit paid date: the booking's last update is when it was paid.
    paid_at:
      str(root.updatedAt) ??
      str(asRecord(root.metaInfo)?.updatedAt) ??
      str(root.createdAt),
    amount: Number.isFinite(amount) ? amount : null,
    currency: str(details.currency),
    order_id: str(details.orderId),
    status: str(root.status) ?? str(asRecord(root.metaInfo)?.status),
  };
  writeAll(all);
}

/** Overlay remembered payment details; returns the registration untouched if none/already paid. */
export function withRememberedPayment(
  registration: DriverRegistration,
): DriverRegistration {
  const saved = readAll()[registration._id];
  if (!saved || registration.payment?.status === "paid") return registration;
  const current = registration.payment;
  return {
    ...registration,
    // The registration can still read "pending" while confirm-booking already says "paid".
    status: saved.status ?? registration.status,
    payment: {
      ...current,
      status: "paid",
      amount: saved.amount ?? current?.amount ?? 0,
      currency: saved.currency ?? current?.currency,
      order_id: current?.order_id ?? saved.order_id,
      transaction_id: current?.transaction_id ?? saved.transaction_id,
      paid_at: current?.paid_at ?? saved.paid_at,
    },
  };
}
