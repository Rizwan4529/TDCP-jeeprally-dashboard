import type { RallyEvent, RallyEventCategory } from "@/api/types/rally";
import { ENUMS } from "@/utils/constants";

function getSecureStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getRallyEventId(event: RallyEvent | null | undefined): string {
  if (!event) return "";
  return event._id || event.id || "";
}

/** Persists the active rally event id after GET /rally/active. */
export function saveActiveEventId(eventId: string): void {
  const storage = getSecureStorage();
  if (!storage || !eventId.trim()) return;
  try {
    storage.setItem(ENUMS.ACTIVE_EVENT_ID, eventId.trim());
  } catch {
    /* ignore quota / private mode */
  }
}

/** Reads the cached active rally event id from localStorage. */
export function fetchActiveEventId(): string | null {
  const storage = getSecureStorage();
  if (!storage) return null;
  try {
    const value = storage.getItem(ENUMS.ACTIVE_EVENT_ID);
    return value?.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

export function clearActiveEventId(): void {
  const storage = getSecureStorage();
  if (!storage) return;
  try {
    storage.removeItem(ENUMS.ACTIVE_EVENT_ID);
  } catch {
    /* ignore */
  }
}

/** Prefer live rally data; fall back to cached id from localStorage. */
export function resolveActiveEventId(
  event: RallyEvent | null | undefined,
): string {
  const fromEvent = getRallyEventId(event);
  if (fromEvent) return fromEvent;
  return fetchActiveEventId() ?? "";
}

export function getRallyEventCategory(
  event: RallyEvent | null | undefined,
): RallyEventCategory | null {
  const c = event?.category;
  if (c && typeof c === "object" && "_id" in c) return c;
  return null;
}

export function getRallyEventCategoryTitle(
  event: RallyEvent | null | undefined,
): string | null {
  const cat = getRallyEventCategory(event);
  if (cat?.title) return cat.title;
  if (typeof event?.category === "string") return event.category;
  return null;
}

function parseRallyDate(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function endOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

export function formatRegistrationDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export type RegistrationWindow =
  | {
      status: "open";
      isOpen: true;
      startIso: string | null;
      endIso: string | null;
    }
  | {
      status: "not_started";
      isOpen: false;
      startIso: string;
      endIso: string | null;
    }
  | {
      status: "closed";
      isOpen: false;
      startIso: string | null;
      endIso: string;
    }
  | {
      status: "unavailable";
      isOpen: false;
      startIso: null;
      endIso: null;
    };

/**
 * Registration is allowed only between registration_start_date and
 * registration_end_date (inclusive calendar days in UTC).
 * If both dates are missing, registration is treated as unavailable.
 */
export function getRegistrationWindow(
  event: RallyEvent | null | undefined,
  now = new Date(),
): RegistrationWindow {
  if (!event) {
    return {
      status: "unavailable",
      isOpen: false,
      startIso: null,
      endIso: null,
    };
  }

  const startIso = event.registration_start_date?.trim() || null;
  const endIso = event.registration_end_date?.trim() || null;
  const start = parseRallyDate(startIso);
  const end = parseRallyDate(endIso);

  if (!start && !end) {
    return {
      status: "unavailable",
      isOpen: false,
      startIso: null,
      endIso: null,
    };
  }

  const nowMs = now.getTime();
  const opensAt = start ? startOfUtcDay(start).getTime() : null;
  const closesAt = end ? endOfUtcDay(end).getTime() : null;

  if (opensAt != null && nowMs < opensAt) {
    return {
      status: "not_started",
      isOpen: false,
      startIso: startIso!,
      endIso,
    };
  }

  if (closesAt != null && nowMs > closesAt) {
    return {
      status: "closed",
      isOpen: false,
      startIso,
      endIso: endIso!,
    };
  }

  return {
    status: "open",
    isOpen: true,
    startIso,
    endIso,
  };
}

export function getRegistrationWindowMessage(
  window: RegistrationWindow,
  eventName?: string | null,
): { title: string; description: string } {
  const rallyLabel = eventName?.trim() || "this rally";

  if (window.status === "not_started") {
    const opens = formatRegistrationDate(window.startIso);
    const closes = window.endIso
      ? formatRegistrationDate(window.endIso)
      : null;
    return {
      title: "Registration has not opened yet",
      description: closes
        ? `Registration for ${rallyLabel} opens on ${opens} and closes on ${closes}. Please check back once the registration window begins.`
        : `Registration for ${rallyLabel} opens on ${opens}. Please check back once the registration window begins.`,
    };
  }

  if (window.status === "closed") {
    const closes = formatRegistrationDate(window.endIso);
    return {
      title: "Registration is closed",
      description: `The registration window for ${rallyLabel} ended on ${closes}. New registrations are no longer accepted for this event.`,
    };
  }

  return {
    title: "Registration unavailable",
    description: `Registration dates for ${rallyLabel} are not available yet. Please check back later or contact support.`,
  };
}
