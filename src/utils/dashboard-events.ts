import type { RallyEvent } from "@/api/types/rally";

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
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS_SHORT[d.getUTCMonth()] ?? "—";
  return { day, month };
}

export function formatEventDateRangeHero(
  startIso: string,
  endIso: string,
): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dayStart = start.getUTCDate();
  const dayEnd = end.getUTCDate();
  const monthStart = MONTHS_SHORT[start.getUTCMonth()] ?? "";
  const monthEnd = MONTHS_SHORT[end.getUTCMonth()] ?? "";
  const year = start.getUTCFullYear();

  if (
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCFullYear() === end.getUTCFullYear()
  ) {
    return `${dayStart} - ${dayEnd} ${monthStart} ${year}`;
  }

  return `${dayStart} ${monthStart} - ${dayEnd} ${monthEnd} ${year}`;
}

export function formatEventScheduleDates(
  startIso: string,
  endIso: string,
): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function sortEventsByNearestDate(events: RallyEvent[]): RallyEvent[] {
  return [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
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
  return event.rally_start_date ?? event.date;
}
