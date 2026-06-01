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
