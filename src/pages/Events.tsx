import { useMemo, useState } from "react";
import { Clock3Icon, MapPinIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/common/Typography";
import { cn } from "@/lib/utils";
import { useRallyEventsQuery } from "@/hooks/api/use-rally-events";
import type { RallyEventStatus, RallyEventType } from "@/api/types/rally";
import { toPublicFileUrl } from "@/utils/helpers";

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

const surfaceCard =
  "rounded-lg border border-[#E0E0E0] bg-white shadow-none ring-0";

function formatDayMonth(isoDate: string): { day: string; month: string } {
  const d = new Date(isoDate);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS_SHORT[d.getUTCMonth()] ?? "—";
  return { day, month };
}

function formatISODate(isoDate: string): string {
  const d = new Date(isoDate);
  // Backend is UTC ISO; show user-local calendar date, but keep month short.
  return d.toLocaleDateString(undefined, {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function EventsPage() {
  const [status, setStatus] = useState<RallyEventStatus | "">("");
  const [type, setType] = useState<RallyEventType | "">("");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");

  const appliedQuery = useMemo(
    () => ({
      status: status === "" ? undefined : status,
      type: type === "" ? undefined : type,
      search: search.trim() === "" ? undefined : search.trim(),
    }),
    [status, type, search],
  );

  const eventsQuery = useRallyEventsQuery(appliedQuery);
  const events = Array.isArray(eventsQuery.data?.data)
    ? eventsQuery.data.data
    : [];

  return (
    <div className="space-y-6 pb-3 pt-8">
      <Card className={cn(surfaceCard, "gap-0 py-0")}>
        <CardHeader className="px-7 pb-5 pt-8 sm:px-10">
          <CardTitle className="text-[22px] font-bold uppercase leading-none text-[#2D2D31]">
            Rally Events
          </CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-10 sm:px-10">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Typography as="label" variant="label" className="text-[#6B7890]">
                Status
              </Typography>
              <select
                aria-label="Filter by status"
                className="h-11 w-full rounded-md border border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838] outline-none focus-visible:ring-2 focus-visible:ring-[#3FA565]/30"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as RallyEventStatus | "")
                }
              >
                <option value="">All</option>
                <option value="upcoming">upcoming</option>
                <option value="active">active</option>
                <option value="completed">completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <Typography as="label" variant="label" className="text-[#6B7890]">
                Type
              </Typography>
              <select
                aria-label="Filter by type"
                className="h-11 w-full rounded-md border border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838] outline-none focus-visible:ring-2 focus-visible:ring-[#3FA565]/30"
                value={type}
                onChange={(e) => setType(e.target.value as RallyEventType | "")}
              >
                <option value="">All</option>
                <option value="upcoming">upcoming</option>
                <option value="past">past</option>
              </select>
            </div>

            <div className="space-y-2">
              <Typography as="label" variant="label" className="text-[#6B7890]">
                Search
              </Typography>
              <input
                aria-label="Search events"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="e.g. desert"
                className="h-11 w-full rounded-md border border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838] outline-none focus-visible:ring-2 focus-visible:ring-[#3FA565]/30"
              />
            </div>

            <div className="flex flex-col justify-end gap-3">
              <Button
                type="button"
                className="h-11 rounded-md bg-[#3FA565] px-6 text-[14px] font-semibold hover:bg-[#369A5D]"
                onClick={() => setSearch(searchDraft)}
                disabled={eventsQuery.isPending}
              >
                Apply
              </Button>
              <Button
                type="button"
                variant="primary-outline"
                className="h-11 rounded-md px-6 text-[14px] font-semibold"
                onClick={() => {
                  setStatus("");
                  setType("");
                  setSearchDraft("");
                  setSearch("");
                }}
                disabled={eventsQuery.isPending}
              >
                Clear
              </Button>
            </div>
          </div>

          {eventsQuery.isError ? (
            <div className="mt-6 rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
              <Typography variant="body" className="text-[#8B2B2B]">
                {eventsQuery.error?.message ??
                  "Could not load rally events. Try again later."}
              </Typography>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {eventsQuery.isLoading ? (
        <Card className={cn(surfaceCard, "p-6")}>
          <Typography variant="body" className="text-[#6B7890]">
            Loading events…
          </Typography>
        </Card>
      ) : eventsQuery.data?.success === false ? (
        <Card className={cn(surfaceCard, "p-6")}>
          <Typography variant="body" className="text-[#8B2B2B]">
            {eventsQuery.data?.message ?? "Could not load events."}
          </Typography>
        </Card>
      ) : events.length === 0 ? (
        <Card className={cn(surfaceCard, "p-6")}>
          <Typography variant="body" className="text-[#6B7890]">
            No events found for the selected filters.
          </Typography>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const { day, month } = formatDayMonth(event.date);
            const banner = toPublicFileUrl(event.thumbnail_image);
            return (
              <Card
                key={event._id}
                className={cn(surfaceCard, "overflow-hidden rounded-[14px]")}
              >
                {/* border-b border-[#E8E8E8] */}
                <div className="flex gap-4  p-4">
                  <div className="flex size-[52px] shrink-0 flex-col items-center justify-center rounded-[4px] bg-dashboard-icon-bg text-[#319F60]">
                    <span className="text-[20px] font-bold leading-none">
                      {day}
                    </span>
                    <span className="mt-1 text-[10px] font-medium leading-none text-[#61726A]">
                      {month}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Typography
                        as="h3"
                        variant="label"
                        className="truncate text-[14px] font-semibold text-[#1F1838]"
                      >
                        {event.name}
                      </Typography>
                      {event.is_featured ? (
                        <span className="shrink-0 rounded-full bg-[#EAF6EF] px-3 py-1 text-[10px] font-semibold text-[#1F6B43]">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <Typography
                      variant="caption"
                      className="mt-1 block text-[#6B7890]"
                    >
                      {event.organiser} · {event.location}
                    </Typography>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#7F8697]">
                      <span className="inline-flex items-center gap-1">
                        <Clock3Icon className="size-3.5" />
                        {formatISODate(event.date)}
                        {" – "}
                        {formatISODate(event.end_date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="size-3.5 fill-[#7F8697]" />
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
                {banner ? (
                  <div className="h-28 overflow-hidden">
                    <img
                      src={banner}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
