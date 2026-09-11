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

export function buildJeepRallyOrderDescription(
  details: (string | number | null | undefined)[],
): string {
  const parts = ["Jeep Rally registration", ...details]
    .map((part) => String(part ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return parts.join(" | ");
}

export function buildPaymentReturnUrl(orderId: string): string {
  const origin = window.location.origin;
  return `${origin}/payment-callback?orderId=${encodeURIComponent(orderId)}`;
}
