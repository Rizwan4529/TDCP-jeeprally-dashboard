import type { CreateRegistrationPayload } from "@/api/types/registrations";

const STORAGE_KEY = "jeeprally_pending_payment";

export type PendingRegistrationPayment = {
  orderId: string;
  amount: number;
  payload: CreateRegistrationPayload;
  orderDescription: string;
  createdAt: number;
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function savePendingRegistrationPayment(
  pending: PendingRegistrationPayment,
): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

export function loadPendingRegistrationPayment(): PendingRegistrationPayment | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingRegistrationPayment;
    if (!parsed?.orderId || !parsed?.payload) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingRegistrationPayment(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function createJeepRallyOrderId(): string {
  return `JEEPRALLY-${Date.now()}`;
}

/** Payment gateway `order.description` must be fewer than 128 characters. */
const ORDER_DESCRIPTION_MAX_LENGTH = 127;

export function buildJeepRallyOrderDescription(
  details: (string | number | null | undefined)[],
): string {
  const parts = ["Jeep Rally registration", ...details]
    .map((part) => String(part ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  let description = parts.join(" | ");
  if (description.length <= ORDER_DESCRIPTION_MAX_LENGTH) {
    return description;
  }

  // Drop trailing detail segments until it fits, then hard-trim if needed.
  while (parts.length > 1 && description.length > ORDER_DESCRIPTION_MAX_LENGTH) {
    parts.pop();
    description = parts.join(" | ");
  }

  if (description.length <= ORDER_DESCRIPTION_MAX_LENGTH) {
    return description;
  }

  return description.slice(0, ORDER_DESCRIPTION_MAX_LENGTH).trimEnd();
}

export function buildPaymentReturnUrl(orderId: string): string {
  const origin = window.location.origin;
  return `${origin}/payment-callback?orderId=${encodeURIComponent(orderId)}`;
}
