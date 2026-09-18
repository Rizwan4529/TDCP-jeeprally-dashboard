import * as React from "react";
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  CalendarOffIcon,
  Clock3Icon,
  LayoutGridIcon,
  MapPinIcon,
  MedalIcon,
  TrophyIcon,
} from "lucide-react";

import DashboardBg from "@/assets/images/dashboard-png.png";
import DashboardCar from "@/assets/images/dashboard-car.png";
import RankingIcon from "@/assets/icons/ranking-icon.svg";
import TeamIcon from "@/assets/icons/team-icon.svg";
import TotalPointsIcon from "@/assets/icons/total-points-icon.svg";
import VehicleIcon from "@/assets/icons/vehicle-icon.svg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticipationRankingChart } from "@/components/dashboard/ParticipationRankingChart";
import {
  DashboardPanelEmptyState,
  DriverSummarySkeleton,
  EventHeroSkeleton,
  EventScheduleListSkeleton,
  RankingTableSkeleton,
  StatsGridSkeleton,
} from "@/components/common/LoadingStates";
import { useActiveRallyQuery } from "@/hooks/api/use-active-rally";
import { useDriverDashboardQuery } from "@/hooks/api/use-dashboard";
import { useRallyEventsQuery } from "@/hooks/api/use-rally-events";
import { useAuthRedirectOnQueryError } from "@/hooks/use-auth-redirect";
import type { RallyEvent } from "@/api/types/rally";
import { fetchAuthToken, toPublicFileUrl } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import {
  formatDayMonth,
  formatEventScheduleDates,
  getActiveRallyHeroCountdown,
  getCountdownParts,
  getEventPrimaryDate,
  getScheduledEventsExcludingActive,
  resolveEventHeroDateRange,
} from "@/utils/dashboard-events";
import {
  buildDriverSummary,
  buildRankingRows,
  buildStatCards,
  formatOrdinalPosition,
  type StatCardView,
} from "@/utils/dashboard-me";
import {
  formatRegistrationDate,
  getRallyEventId,
  getRegistrationWindow,
  getRegistrationWindowMessage,
} from "@/utils/rally-event";
import {
  SCROLL_PAGE,
  SIDEBAR_PAGE_PADDING,
} from "@/components/layout/pageLayout";

const STAT_ICONS = {
  ranking: RankingIcon,
  vehicle: VehicleIcon,
  team: TeamIcon,
  points: TotalPointsIcon,
} as const;

const surfaceCard =
  "rounded-[10px] border border-[#E8E0D8] bg-white shadow-none ring-0";

/** Fixed panel height; body scrolls vertically inside the card. */
const dashboardScrollCardClass = cn(
  surfaceCard,
  "flex max-h-[320px] min-h-[240px] flex-col gap-0 overflow-hidden py-0",
);

const dashboardPanelScrollClass =
  "dashboard-panel-scroll min-h-0 flex-1 overflow-y-auto pr-0.5";

const locationIconClass = "size-3.5 shrink-0 text-[#7F8697]";

function useCountdown(targetIso: string | null | undefined) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!targetIso) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [targetIso]);

  return React.useMemo(
    () => getCountdownParts(targetIso, now),
    [targetIso, now],
  );
}

export default function DashboardPage() {
  const token = React.useMemo(() => Boolean(fetchAuthToken()), []);
  const activeRallyQuery = useActiveRallyQuery(token);
  const upcomingQuery = useRallyEventsQuery({ status: "upcoming" });
  const dashboardQuery = useDriverDashboardQuery(token);

  useAuthRedirectOnQueryError(dashboardQuery.error, dashboardQuery.isError);
  useAuthRedirectOnQueryError(upcomingQuery.error, upcomingQuery.isError);
  useAuthRedirectOnQueryError(activeRallyQuery.error, activeRallyQuery.isError);

  const activeRally = activeRallyQuery.data?.data ?? null;
  const activeRallyId = getRallyEventId(activeRally);

  const events = Array.isArray(upcomingQuery.data?.data)
    ? upcomingQuery.data.data
    : [];
  const dashboardData = dashboardQuery.data?.data;

  const scheduledEvents = React.useMemo(
    () => getScheduledEventsExcludingActive(events, activeRallyId),
    [events, activeRallyId],
  );

  const showActiveRally =
    !activeRallyQuery.isLoading &&
    !activeRallyQuery.isError &&
    activeRally != null;

  const showActiveRallyEmpty =
    !activeRallyQuery.isLoading &&
    !activeRallyQuery.isError &&
    activeRally == null;

  const statCards = React.useMemo(
    () => buildStatCards(dashboardData?.cards),
    [dashboardData?.cards],
  );
  const rankingRows = React.useMemo(
    () => buildRankingRows(dashboardData?.overall_rallies),
    [dashboardData?.overall_rallies],
  );
  const hasRallyHistory =
    (dashboardData?.overall_rallies?.length ?? 0) > 0 ||
    (dashboardData?.best_rallies?.length ?? 0) > 0;

  const driverSummary = React.useMemo(
    () => buildDriverSummary(dashboardData),
    [dashboardData],
  );

  return (
    <div className={cn(SCROLL_PAGE, SIDEBAR_PAGE_PADDING)}>
      <div className="space-y-6 pb-2">
      {activeRallyQuery.isLoading ? (
        <EventHeroSkeleton />
      ) : showActiveRally ? (
        <EventHero event={activeRally} />
      ) : showActiveRallyEmpty ? (
        <ActiveRallyEmpty />
      ) : activeRallyQuery.isError ? (
        <ActiveRallyError message={activeRallyQuery.error?.message} />
      ) : null}
      <StatsGrid
        cards={statCards}
        isLoading={dashboardQuery.isLoading}
        isError={dashboardQuery.isError}
        hasHistory={hasRallyHistory}
      />

      <div className="grid gap-6 xl:grid-cols-[1.04fr_1fr]">
        <EventSchedule
          events={scheduledEvents}
          hasOtherUpcoming={events.length > 0}
          isLoading={upcomingQuery.isLoading}
          isError={upcomingQuery.isError}
          errorMessage={upcomingQuery.error?.message}
        />
        <DriverSummary
          highlights={driverSummary.highlights}
          bestPosition={driverSummary.bestPosition}
          isEmpty={!hasRallyHistory}
          isLoading={dashboardQuery.isLoading}
          isError={dashboardQuery.isError}
          errorMessage={dashboardQuery.error?.message}
        />
      </div>

      <OverallRanking
        rows={rankingRows}
        isLoading={dashboardQuery.isLoading}
        isError={dashboardQuery.isError}
        errorMessage={dashboardQuery.error?.message}
      />

      <ParticipationRankingChart enabled={token} />
      </div>
    </div>
  );
}

function NextEventPanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="pt-3 pb-1">
      <Card className={cn(surfaceCard, "overflow-hidden py-0")}>
        <div className="flex min-h-[120px] items-center justify-center px-6 py-8">
          {children}
        </div>
      </Card>
    </section>
  );
}

function ActiveRallyEmpty() {
  return (
    <NextEventPanel>
      <DashboardPanelEmptyState
        icon={CalendarDaysIcon}
        title="No active rally"
        description="There is no active rally right now. Check back when registration opens for the next event."
        className="min-h-0 w-full max-w-md border-none bg-transparent py-6"
      />
    </NextEventPanel>
  );
}

function ActiveRallyError({ message }: { message?: string }) {
  return (
    <NextEventPanel>
      <DashboardPanelEmptyState
        icon={AlertCircleIcon}
        title="Could not load active rally"
        description={
          message ??
          "Active rally details could not be loaded. Please try again later."
        }
        variant="error"
        className="min-h-0 w-full max-w-md border-none bg-transparent py-6"
      />
    </NextEventPanel>
  );
}

function heroStatusToneClass(
  tone: ReturnType<typeof getActiveRallyHeroCountdown>["statusTone"],
): string {
  switch (tone) {
    case "open":
      return "border-secondary/80 bg-primary/90 text-white";
    case "upcoming":
      return "border-secondary/80 bg-[#9A6B00]/85 text-white";
    case "closed":
      return "border-white/35 bg-black/45 text-white";
    default:
      return "border-white/30 bg-black/40 text-white";
  }
}

function EventHero({ event }: { event: RallyEvent }) {
  const registrationWindow = React.useMemo(
    () => getRegistrationWindow(event),
    [event],
  );
  const heroCountdown = React.useMemo(
    () => getActiveRallyHeroCountdown(event, registrationWindow),
    [event, registrationWindow],
  );
  const countdown = useCountdown(heroCountdown.targetIso);
  const dateRange = resolveEventHeroDateRange(event);
  const windowMessage = React.useMemo(
    () => getRegistrationWindowMessage(registrationWindow, event.name),
    [registrationWindow, event.name],
  );

  const coverUrl =
    toPublicFileUrl(event.cover_image) ??
    toPublicFileUrl(event.banner_image) ??
    null;

  return (
    <section className="relative overflow-visible pt-3 pb-1">
      <div className="relative min-h-[220px] overflow-hidden rounded-[10px] bg-primary-dark">
        <img
          src={coverUrl ?? DashboardBg}
          alt=""
          decoding="async"
          className="absolute inset-0 size-full object-cover object-center [image-rendering:auto]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-black/15" />
        <div className="relative z-10 flex min-h-[220px] max-w-[calc(100%-1.5rem)] flex-col justify-center px-7 py-6 text-white sm:max-w-[480px] sm:px-9 sm:py-7 md:max-w-[min(56%,520px)]">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase leading-none tracking-wide">
              Active rally
            </p>
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                heroStatusToneClass(heroCountdown.statusTone),
              )}
            >
              {heroCountdown.statusLabel}
            </span>
          </div>
          <h2 className="mt-3 text-[22px] font-bold leading-snug sm:text-[24px]">
            {event.name}
          </h2>
          {event.edition_number > 0 ? (
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/85">
              Edition {event.edition_number}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-semibold">
            <span className="inline-flex items-center gap-2">
              <CalendarDaysIcon className="size-4 text-secondary" />
              {dateRange}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPinIcon
                className="size-4 text-secondary"
                strokeWidth={2.25}
              />
              {event.location}
            </span>
          </div>

          {registrationWindow.status === "open" && registrationWindow.endIso ? (
            <p className="mt-3 text-[12px] leading-relaxed text-white/90">
              Registration is open through{" "}
              {formatRegistrationDate(registrationWindow.endIso)}.
            </p>
          ) : registrationWindow.status === "not_started" ||
            registrationWindow.status === "closed" ||
            registrationWindow.status === "unavailable" ? (
            <p className="mt-3 max-w-md text-[12px] leading-relaxed text-white/90">
              {windowMessage.description}
            </p>
          ) : null}

          {heroCountdown.showCountdown ? (
            <div className="mt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-white/85">
                {heroCountdown.label}
              </p>
              <div className="flex items-end text-secondary">
                {(
                  [
                    [countdown.days, "Days"],
                    [countdown.hours, "Hrs"],
                    [countdown.mins, "Mins"],
                    [countdown.secs, "Secs"],
                  ] as const
                ).map(([value, label], index) => (
                  <div
                    key={label}
                    className={cn(
                      "min-w-[52px]",
                      index > 0 && "border-l border-white/45 pl-4",
                    )}
                  >
                    <p className="text-[24px] font-bold leading-none">{value}</p>
                    <p className="mt-1 text-[9px] font-semibold uppercase text-white">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/30 bg-black/35 px-3 py-2 text-[12px] font-semibold text-white">
              <CalendarOffIcon className="size-4 text-secondary" />
              {heroCountdown.label}
            </div>
          )}
        </div>
      </div>

      <img
        src={DashboardCar}
        alt="Green rally car"
        className="pointer-events-none absolute top-1/2 right-[-38px] z-20 hidden w-[46%] min-w-[300px] max-w-[450px] -translate-y-1/2 object-contain drop-shadow-[0_18px_16px_rgba(0,0,0,0.22)] md:block xl:right-10"
      />
    </section>
  );
}

function StatsGrid({
  cards,
  isLoading,
  isError,
  hasHistory,
}: {
  cards: StatCardView[];
  isLoading: boolean;
  isError: boolean;
  hasHistory: boolean;
}) {
  if (isLoading) return <StatsGridSkeleton />;
  if (isError) {
    return (
      <Card className={cn(surfaceCard, "py-0")}>
        <DashboardPanelEmptyState
          icon={AlertCircleIcon}
          title="Could not load stats"
          description="Your ranking, team, and points could not be loaded. Refresh the page or try again later."
          variant="error"
          className="min-h-[120px] border-none bg-white"
        />
      </Card>
    );
  }

  if (!hasHistory) {
    return (
      <Card className={cn(surfaceCard, "py-0")}>
        <DashboardPanelEmptyState
          icon={LayoutGridIcon}
          title="No driver stats yet"
          description="Complete a rally registration and finish an event to see your ranking, team, and points here."
          className="min-h-[120px] border-none bg-white"
        />
      </Card>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const icon = STAT_ICONS[card.iconKey];
        return (
          <Card
            key={card.label}
            className={cn(
              surfaceCard,
              "h-[82px] flex-row items-center justify-between gap-4 px-5 py-0",
            )}
          >
            <div className="flex min-w-0 items-center gap-4">
              {card.iconMode === "circle" ? (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-dashboard-icon-bg">
                  <img src={icon} alt="" className="size-7" />
                </span>
              ) : null}

              <div className="min-w-0">
                <p className="text-[16px] font-medium leading-tight text-[#AAAAB2]">
                  {card.label}
                </p>
                <p className="mt-1 truncate text-[19px] font-bold leading-tight text-[#24242B]">
                  {card.value}
                </p>
              </div>
            </div>

            {card.iconMode === "plain" ? (
              <img
                src={icon}
                alt=""
                className={cn(
                  "shrink-0 object-contain",
                  card.iconKey === "team" ? "size-[50px]" : "size-14",
                )}
              />
            ) : null}
          </Card>
        );
      })}
    </section>
  );
}

function EventSchedule({
  events,
  hasOtherUpcoming,
  isLoading,
  isError,
  errorMessage,
}: {
  events: RallyEvent[];
  hasOtherUpcoming: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}) {
  return (
    <Card className={dashboardScrollCardClass}>
      <CardHeader className="shrink-0 px-5 pb-4 pt-6">
        <CardTitle className="text-[18px] font-bold uppercase text-[#2D2D31]">
          Events Scheduled
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-0">
        <div className={dashboardPanelScrollClass}>
          {isLoading ? (
            <EventScheduleListSkeleton count={3} />
          ) : isError ? (
            <DashboardPanelEmptyState
              icon={AlertCircleIcon}
              title="Could not load events"
              description={
                errorMessage ??
                "Scheduled events could not be loaded. Please try again later."
              }
              variant="error"
            />
          ) : events.length === 0 ? (
            <DashboardPanelEmptyState
              icon={CalendarOffIcon}
              title={
                hasOtherUpcoming
                  ? "No more events scheduled"
                  : "No upcoming events"
              }
              description={
                hasOtherUpcoming
                  ? "When additional rallies are announced, they will appear here."
                  : "Check back soon for new rally dates and registration windows."
              }
            />
          ) : (
            <div className="space-y-4">
              {events.map((item) => {
                const primaryDate = getEventPrimaryDate(item);
                const { day, month } = formatDayMonth(primaryDate);
                return (
                  <div
                    key={item._id}
                    className="flex min-h-[62px] items-center gap-4 rounded-[10px] border border-[#E8E0D8] bg-gradient-to-r from-white to-[#FAFBFF] px-3"
                  >
                    <div className="flex size-[50px] shrink-0 flex-col items-center justify-center rounded-[4px] bg-dashboard-icon-bg text-primary">
                      <span className="text-[20px] font-bold leading-none">
                        {day}
                      </span>
                      <span className="mt-1 text-[10px] font-medium leading-none text-[#61726A]">
                        {month}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-semibold leading-tight text-[#26262C]">
                        {item.name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#7F8697]">
                        <span className="inline-flex items-center gap-1">
                          <Clock3Icon className={locationIconClass} />
                          {formatEventScheduleDates(
                            primaryDate || item.date,
                            item.end_date || item.rally_start_date || primaryDate,
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPinIcon
                            className={locationIconClass}
                            strokeWidth={2.25}
                          />
                          {item.location}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DriverSummary({
  highlights,
  bestPosition,
  isEmpty,
  isLoading,
  isError,
  errorMessage,
}: {
  highlights: { label: string; value: string; color: string }[];
  bestPosition: number | null;
  isEmpty: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}) {
  return (
    <Card className={dashboardScrollCardClass}>
      <CardHeader className="shrink-0 px-5 pb-3 pt-6">
        <CardTitle className="text-[18px] font-bold uppercase text-[#2D2D31]">
          Driver Overall Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-0">
        <div className={dashboardPanelScrollClass}>
          {isLoading ? (
            <DriverSummarySkeleton />
          ) : isError ? (
            <DashboardPanelEmptyState
              icon={AlertCircleIcon}
              title="Could not load summary"
              description={
                errorMessage ??
                "Your driver summary could not be loaded. Please try again later."
              }
              variant="error"
            />
          ) : isEmpty ? (
            <DashboardPanelEmptyState
              icon={MedalIcon}
              title="No rally history yet"
              description="Finish a rally to unlock your best finish, points, and performance highlights here."
            />
          ) : (
            <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto]">
              <div className="space-y-5">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[14px]"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#34343A]">{item.label}</span>
                    <span className="max-w-[140px] truncate text-right font-bold text-black sm:max-w-[180px]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className={cn(
                  "relative mx-auto flex size-[154px] flex-col items-center justify-center rounded-full border-[5px] shadow-[0_12px_18px_rgba(15,23,42,0.08)]",
                  bestPosition === 1
                    ? "border-secondary bg-[#FFF8EB]"
                    : "border-primary/25 bg-primary/10",
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Best finish
                </span>
                <span
                  className={cn(
                    "mt-1 text-[36px] font-bold leading-none",
                    bestPosition === 1 ? "text-primary-dark" : "text-primary",
                  )}
                >
                  {bestPosition != null
                    ? formatOrdinalPosition(bestPosition)
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OverallRanking({
  rows,
  isLoading,
  isError,
  errorMessage,
}: {
  rows: ReturnType<typeof buildRankingRows>;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}) {
  return (
    <Card className={dashboardScrollCardClass}>
      <CardHeader className="shrink-0 px-5 pb-4 pt-6">
        <CardTitle className="text-[18px] font-bold uppercase text-[#2D2D31]">
          Overall Ranking
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-0">
        <div className={cn(dashboardPanelScrollClass, "overflow-x-auto")}>
          {isLoading ? (
            <RankingTableSkeleton rows={4} />
          ) : isError ? (
            <DashboardPanelEmptyState
              icon={AlertCircleIcon}
              title="Could not load rankings"
              description={
                errorMessage ??
                "Your overall ranking history could not be loaded. Please try again later."
              }
              variant="error"
            />
          ) : rows.length === 0 ? (
            <DashboardPanelEmptyState
              icon={TrophyIcon}
              title="No completed rallies yet"
              description="Your past rally results and points will show up here after you finish an event."
            />
          ) : (
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F0F1F4] text-[11px] font-bold uppercase text-[#5D6371]">
                  <th className="px-3 py-3">Year</th>
                  <th className="px-3 py-3">Events</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Overall Result</th>
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#E6E6E9] text-[12px] text-[#70727B]"
                  >
                    <td className="px-3 py-3">{row.year}</td>
                    <td className="px-3 py-3">{row.event}</td>
                    <td className="px-3 py-3">{row.category}</td>
                    <td
                      className={cn(
                        "px-3 py-3 font-medium",
                        row.isFirst && "text-primary",
                      )}
                    >
                      {row.result}
                    </td>
                    <td className="px-3 py-3">{row.time}</td>
                    <td className="px-3 py-3 text-right font-semibold text-[#24242B]">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
