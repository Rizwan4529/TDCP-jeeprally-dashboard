import type { RallyEvent } from "@/api/types/rally";
import {
  getRegistrationWindow,
  type RegistrationWindow,
} from "@/utils/rally-event";

const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

export function formatDayMonth(isoDate: string): { day: string; month: string } {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return { day: "—", month: "—" };
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS_SHORT[d.getUTCMonth()] ?? "—";
  return { day, month };
}

export function formatEventDateRangeHero(
  startIso?: string | null,
  endIso?: string | null,
): string {
  const start = startIso?.trim() ? new Date(startIso) : null;
  const end = endIso?.trim() ? new Date(endIso) : null;
  const startOk = start != null && !Number.isNaN(start.getTime());
  const endOk = end != null && !Number.isNaN(end.getTime());

  if (!startOk && !endOk) return "—";

  if (startOk && !endOk) {
    const day = start.getUTCDate();
    const month = MONTHS_SHORT[start.getUTCMonth()] ?? "";
    const year = start.getUTCFullYear();
    return `${day} ${month} ${year}`;
  }

  if (!startOk && endOk) {
    const day = end.getUTCDate();
    const month = MONTHS_SHORT[end.getUTCMonth()] ?? "";
    const year = end.getUTCFullYear();
    return `${day} ${month} ${year}`;
  }

  const dayStart = start!.getUTCDate();
  const dayEnd = end!.getUTCDate();
  const monthStart = MONTHS_SHORT[start!.getUTCMonth()] ?? "";
  const monthEnd = MONTHS_SHORT[end!.getUTCMonth()] ?? "";
  const year = start!.getUTCFullYear();

  if (
    start!.getUTCMonth() === end!.getUTCMonth() &&
    start!.getUTCFullYear() === end!.getUTCFullYear()
  ) {
    if (dayStart === dayEnd) {
      return `${dayStart} ${monthStart} ${year}`;
    }
    return `${dayStart} - ${dayEnd} ${monthStart} ${year}`;
  }

  return `${dayStart} ${monthStart} - ${dayEnd} ${monthEnd} ${year}`;
}

/**
 * Active rally payloads may omit `date` / `end_date` and only send
 * `rally_start_date` (and optional registration dates).
 */
export function resolveEventHeroDateRange(event: RallyEvent): string {
  const start =
    event.date?.trim() ||
    event.rally_start_date?.trim() ||
    event.registration_start_date?.trim() ||
    "";
  const end =
    event.end_date?.trim() ||
    event.rally_start_date?.trim() ||
    event.registration_end_date?.trim() ||
    start;
  return formatEventDateRangeHero(start || null, end || null);
}

export function formatEventScheduleDates(
  startIso?: string | null,
  endIso?: string | null,
): string {
  const start = startIso?.trim() ? new Date(startIso) : null;
  const end = endIso?.trim() ? new Date(endIso) : null;
  const startOk = start != null && !Number.isNaN(start.getTime());
  const endOk = end != null && !Number.isNaN(end.getTime());
  if (!startOk && !endOk) return "—";

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  if (startOk && endOk) return `${fmt(start)} – ${fmt(end)}`;
  if (startOk) return fmt(start);
  return fmt(end!);
}

/** Best available calendar date for sorting / day-month chips. */
export function getEventPrimaryDate(event: RallyEvent): string {
  return (
    event.date?.trim() ||
    event.rally_start_date?.trim() ||
    event.registration_start_date?.trim() ||
    event.end_date?.trim() ||
    ""
  );
}

export function sortEventsByNearestDate(events: RallyEvent[]): RallyEvent[] {
  return [...events].sort((a, b) => {
    const aMs = new Date(getEventPrimaryDate(a) || 0).getTime();
    const bMs = new Date(getEventPrimaryDate(b) || 0).getTime();
    return aMs - bMs;
  });
}

export function splitUpcomingEvents(events: RallyEvent[]): {
  nextEvent: RallyEvent | null;
  scheduledEvents: RallyEvent[];
} {
  const sorted = sortEventsByNearestDate(events);
  if (sorted.length === 0) {
    return { nextEvent: null, scheduledEvents: [] };
  }
  return {
    nextEvent: sorted[0] ?? null,
    scheduledEvents: sorted.slice(1),
  };
}

/** Upcoming schedule list excluding the active rally already shown in the hero. */
export function getScheduledEventsExcludingActive(
  events: RallyEvent[],
  activeEventId: string | null | undefined,
): RallyEvent[] {
  const activeId = activeEventId?.trim() ?? "";
  const sorted = sortEventsByNearestDate(events);
  if (!activeId) return sorted;
  return sorted.filter((event) => {
    const id = event._id || event.id || "";
    return id !== activeId;
  });
}

export type CountdownParts = {
  days: string;
  hours: string;
  mins: string;
  secs: string;
};

export function getCountdownParts(
  targetIso: string | null | undefined,
  nowMs = Date.now(),
): CountdownParts {
  if (!targetIso) {
    return { days: "00", hours: "00", mins: "00", secs: "00" };
  }

  const diff = Math.max(0, new Date(targetIso).getTime() - nowMs);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1_000);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    mins: String(mins).padStart(2, "0"),
    secs: String(secs).padStart(2, "0"),
  };
}

/** Primary start instant for countdown (prefers rally_start_date when set). */
export function eventCountdownTarget(event: RallyEvent): string {
  return event.rally_start_date ?? event.date ?? "";
}

export type ActiveRallyHeroCountdown = {
  label: string;
  targetIso: string | null;
  showCountdown: boolean;
  statusLabel: string;
  statusTone: "open" | "upcoming" | "closed" | "unavailable";
};

/**
 * Hero countdown / status copy driven by the active rally registration window.
 * - not_started → count down to registration open
 * - open → count down to registration close
 * - closed → count down to rally start when available, else static closed state
 */
export function getActiveRallyHeroCountdown(
  event: RallyEvent,
  window: RegistrationWindow = getRegistrationWindow(event),
): ActiveRallyHeroCountdown {
  if (window.status === "not_started") {
    return {
      label: "Registration opens in",
      targetIso: window.startIso,
      showCountdown: Boolean(window.startIso),
      statusLabel: "Registration soon",
      statusTone: "upcoming",
    };
  }

  if (window.status === "open") {
    return {
      label: "Registration closes in",
      targetIso: window.endIso,
      showCountdown: Boolean(window.endIso),
      statusLabel: "Registration open",
      statusTone: "open",
    };
  }

  if (window.status === "closed") {
    const rallyStart = event.rally_start_date ?? event.date;
    const rallyStartMs = rallyStart ? new Date(rallyStart).getTime() : NaN;
    const rallyUpcoming =
      Number.isFinite(rallyStartMs) && rallyStartMs > Date.now();

    if (rallyUpcoming) {
      return {
        label: "Rally starts in",
        targetIso: rallyStart ?? null,
        showCountdown: true,
        statusLabel: "Registration closed",
        statusTone: "closed",
      };
    }

    return {
      label: "Registration closed",
      targetIso: null,
      showCountdown: false,
      statusLabel: "Registration closed",
      statusTone: "closed",
    };
  }

  return {
    label: "Registration unavailable",
    targetIso: null,
    showCountdown: false,
    statusLabel: "Dates unavailable",
    statusTone: "unavailable",
  };
}
