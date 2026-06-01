import { useEffect, useMemo, useState } from "react";
import {
  CalendarSearchIcon,
  ChevronDownIcon,
  Clock3Icon,
  MapPinIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, EventGridSkeleton } from "@/components/common/LoadingStates";
import { Typography } from "@/components/common/Typography";
import { cn } from "@/lib/utils";
import { useRallyEventsQuery } from "@/hooks/api/use-rally-events";
import type {
  GetRallyEventsQuery,
  RallyEventSort,
  RallyEventStatus,
} from "@/api/types/rally";
import { toPublicFileUrl } from "@/utils/helpers";

const filterControlClass =
  "h-9 rounded-md border border-[#E8E8E8] bg-white text-[13px] text-[#1F1838] outline-none focus-visible:ring-2 focus-visible:ring-[#3FA565]/30";

const YEAR_FILTER_ALL = "all";
const SORT_DEFAULT: RallyEventSort = "date_desc";

const STATUS_OPTIONS: { value: RallyEventStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const SORT_OPTIONS: { value: RallyEventSort; label: string }[] = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
];

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

function buildYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear + 1; year >= currentYear - 15; year -= 1) {
    years.push(year);
  }
  return years;
}

function buildRallyEventsQuery(input: {
  statuses: RallyEventStatus[];
  search: string;
  year: number | "";
  sort: RallyEventSort;
}): GetRallyEventsQuery {
  const query: GetRallyEventsQuery = { sort: input.sort };

  const trimmedSearch = input.search.trim();
  if (trimmedSearch) {
    query.search = trimmedSearch;
  }
  if (input.statuses.length > 0) {
    query.status = input.statuses.join(",");
  }
  if (input.year !== "") {
    query.year = input.year;
  }

  return query;
}

function formatStatusFilterLabel(statuses: RallyEventStatus[]): string {
  if (statuses.length === 0) {
    return "All statuses";
  }
  if (statuses.length === 1) {
    return (
      STATUS_OPTIONS.find((option) => option.value === statuses[0])?.label ??
      "1 status"
    );
  }
  return `${statuses.length} statuses`;
}

function formatDayMonth(isoDate: string): { day: string; month: string } {
  const d = new Date(isoDate);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS_SHORT[d.getUTCMonth()] ?? "—";
  return { day, month };
}

function formatISODate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString(undefined, {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function EventsPage() {
  const yearOptions = useMemo(() => buildYearOptions(), []);
  const [statuses, setStatuses] = useState<RallyEventStatus[]>([]);
  const [year, setYear] = useState<number | "">("");
  const [sort, setSort] = useState<RallyEventSort>(SORT_DEFAULT);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const appliedQuery = useMemo(
    () =>
      buildRallyEventsQuery({
        statuses,
        search: debouncedSearch,
        year,
        sort,
      }),
    [statuses, debouncedSearch, year, sort],
  );

  const hasActiveFilters =
    statuses.length > 0 ||
    year !== "" ||
    sort !== SORT_DEFAULT ||
    search.trim() !== "";

  const eventsQuery = useRallyEventsQuery(appliedQuery);
  const events = Array.isArray(eventsQuery.data?.data)
    ? eventsQuery.data.data
    : [];

  const toggleStatus = (status: RallyEventStatus, checked: boolean) => {
    setStatuses((current) => {
      if (checked) {
        return current.includes(status) ? current : [...current, status];
      }
      return current.filter((value) => value !== status);
    });
  };

  return (
    <div className="space-y-5 pb-3 pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Typography
          as="h1"
          variant="label"
          className="text-[22px] font-bold uppercase leading-none text-[#2D2D31]"
        >
          Rally Events
        </Typography>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full min-w-[180px] sm:w-[220px]">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8A95B5]" />
            <Input
              aria-label="Search events"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className={cn(
                filterControlClass,
                "h-9 pl-8 pr-8 text-[13px] placeholder:text-[#8A95B5]",
              )}
            />
            {search ? (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A95B5] hover:text-[#1F1838]"
                onClick={() => setSearch("")}
              >
                <XIcon className="size-3.5" />
              </button>
            ) : null}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                aria-label="Filter by status"
                className={cn(
                  filterControlClass,
                  "w-full min-w-[132px] justify-between px-2.5 font-normal shadow-none hover:bg-white sm:w-[160px]",
                )}
              >
                <span className="truncate">{formatStatusFilterLabel(statuses)}</span>
                <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-3">
              <div className="space-y-3">
                {STATUS_OPTIONS.map((option) => {
                  const checked = statuses.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className="flex items-center gap-2.5"
                    >
                      <Checkbox
                        id={`event-status-${option.value}`}
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleStatus(option.value, value === true)
                        }
                      />
                      <Label
                        htmlFor={`event-status-${option.value}`}
                        className="cursor-pointer text-[13px] font-normal text-[#1F1838]"
                      >
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <Select
            value={year === "" ? YEAR_FILTER_ALL : String(year)}
            onValueChange={(value) =>
              setYear(value === YEAR_FILTER_ALL ? "" : Number(value))
            }
          >
            <SelectTrigger
              aria-label="Filter by year"
              className={cn(
                filterControlClass,
                "w-full min-w-[120px] shadow-none sm:w-[120px]",
              )}
            >
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={YEAR_FILTER_ALL}>All years</SelectItem>
              {yearOptions.map((optionYear) => (
                <SelectItem key={optionYear} value={String(optionYear)}>
                  {optionYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => setSort(value as RallyEventSort)}
          >
            <SelectTrigger
              aria-label="Sort events"
              className={cn(
                filterControlClass,
                "w-full min-w-[140px] shadow-none sm:w-[150px]",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-[13px] text-[#6B7890] hover:text-[#1F1838]"
              onClick={() => {
                setStatuses([]);
                setYear("");
                setSort(SORT_DEFAULT);
                setSearch("");
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {eventsQuery.isError ? (
        <EmptyState
          icon={CalendarSearchIcon}
          title="Could not load events"
          description={
            eventsQuery.error?.message ??
            "Something went wrong while fetching rally events. Try again later."
          }
          variant="error"
          size="compact"
        />
      ) : null}

      {eventsQuery.isLoading ? (
        <EventGridSkeleton count={6} />
      ) : eventsQuery.data?.success === false ? (
        <EmptyState
          icon={CalendarSearchIcon}
          title="Could not load events"
          description={eventsQuery.data?.message ?? "Could not load events."}
          variant="error"
          size="compact"
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarSearchIcon}
          title="No events found"
          description="Try adjusting your search, status, year, or sort filters."
          variant="muted"
        />
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
                <div className="flex gap-4 p-4">
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
                        <MapPinIcon
                          className="size-3.5 shrink-0 text-[#7F8697]"
                          strokeWidth={2.25}
                        />
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
