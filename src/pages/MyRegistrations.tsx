import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardListIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";
import { toast } from "sonner";

import { CrudTableToolbar } from "@/components/common/CrudTableToolbar";
import { DialogCommon } from "@/components/common/DialogCommon";
import {
  EmptyState,
  TeamsTableSkeleton,
} from "@/components/common/LoadingStates";
import { PageHeader } from "@/components/common/NavigationCommon";
import { Typography } from "@/components/common/Typography";
import {
  PAGE_SHELL,
  SIDEBAR_PAGE_PADDING,
  TABLE_SECTION,
} from "@/components/layout/pageLayout";
import {
  TeamsDataTable,
  TeamsDataTableBody,
  TeamsDataTableHead,
  TeamsDataTableHeader,
  TeamsDataTableHeaderRow,
  TableCell,
  TableRow,
} from "@/components/teams/TeamsDataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DriverRegistration } from "@/api/types/registrations";
import type { RallyEvent } from "@/api/types/rally";
import {
  useActiveEventId,
  useActiveRallyQuery,
} from "@/hooks/api/use-active-rally";
import { useRallyEventsQuery } from "@/hooks/api/use-rally-events";
import { useMyRegistrationsQuery } from "@/hooks/api/use-registrations";
import { useMyTeamsQuery } from "@/hooks/api/use-teams";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants";
import { fetchAuthToken } from "@/utils/helpers";
import { getRallyEventId } from "@/utils/rally-event";
import {
  canUpdateRegistration,
  formatRegisteredAt,
  formatRegistrationStatus,
  getPersonName,
  getRegistrationCategoryLabel,
  getRegistrationEventId,
  resolveRegistrationNavigator,
  resolveRegistrationTeam,
  registrationStatusTone,
} from "@/utils/registration-entries";
import type { Team } from "@/api/types/teams";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const EVENT_FILTER_ALL = "all";

export default function MyRegistrationsPage() {
  return <MyRegistrationsScreen />;
}

function MyRegistrationsScreen() {
  const navigate = useNavigate();
  const token = useMemo(() => fetchAuthToken(), []);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<DriverRegistration | null>(null);
  /** null = follow default (active event when available). */
  const [eventFilter, setEventFilter] = useState<string | null>(null);

  const activeRallyQuery = useActiveRallyQuery(Boolean(token));
  const activeRally = activeRallyQuery.data?.data ?? null;
  const activeEventId = useActiveEventId(Boolean(token));

  const eventsQuery = useRallyEventsQuery(
    { sort: "date_desc" },
    { enabled: Boolean(token) },
  );
  const events = Array.isArray(eventsQuery.data?.data)
    ? eventsQuery.data.data
    : [];

  const registrationsQuery = useMyRegistrationsQuery(Boolean(token));
  const registrations = Array.isArray(registrationsQuery.data?.data)
    ? registrationsQuery.data.data
    : [];

  const teamsQuery = useMyTeamsQuery(Boolean(token));
  const teams = Array.isArray(teamsQuery.data?.data)
    ? teamsQuery.data.data
    : [];

  const resolvedEventFilter =
    eventFilter ?? (activeEventId?.trim() || EVENT_FILTER_ALL);

  const selectedEventName = useMemo(() => {
    if (resolvedEventFilter === EVENT_FILTER_ALL) return "all events";
    if (activeEventId && resolvedEventFilter === activeEventId) {
      return activeRally?.name ?? "the active rally";
    }
    return (
      events.find((e) => getRallyEventId(e) === resolvedEventFilter)?.name ??
      "this event"
    );
  }, [
    resolvedEventFilter,
    activeEventId,
    activeRally?.name,
    events,
  ]);

  const filtered = useMemo(() => {
    const byEvent =
      resolvedEventFilter === EVENT_FILTER_ALL
        ? registrations
        : registrations.filter(
            (r) => getRegistrationEventId(r) === resolvedEventFilter,
          );

    const q = search.trim().toLowerCase();
    if (!q) return byEvent;
    return byEvent.filter((r) => {
      const team = resolveRegistrationTeam(r, teams);
      const navigator = resolveRegistrationNavigator(r, team);
      const haystack = [
        team?.team_name,
        team?.team_number,
        getRegistrationCategoryLabel(r),
        r.status,
        getPersonName(navigator),
        formatRegisteredAt(r.registered_at),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [registrations, resolvedEventFilter, search, teams]);

  const description = registrationsQuery.isLoading
    ? undefined
    : registrations.length === 0
      ? "You have no rally registrations yet."
      : resolvedEventFilter === EVENT_FILTER_ALL
        ? `${registrations.length} entr${registrations.length === 1 ? "y" : "ies"} across all events.`
        : `${filtered.length} entr${filtered.length === 1 ? "y" : "ies"} for ${selectedEventName}.`;

  const resolveRallyForRegistration = (
    registration: DriverRegistration,
  ): RallyEvent | null => {
    const registrationEventId = getRegistrationEventId(registration);
    if (
      activeEventId &&
      registrationEventId === activeEventId &&
      activeRally
    ) {
      return activeRally;
    }
    return (
      events.find((e) => getRallyEventId(e) === registrationEventId) ?? null
    );
  };

  const handleUpdateClick = (registration: DriverRegistration) => {
    const rally = resolveRallyForRegistration(registration);
    const gate = canUpdateRegistration(registration, rally);
    if (!gate.ok) {
      toast.error(gate.reason);
      return;
    }
    void navigate(
      `${ROUTES.REGISTRATION}?edit=${encodeURIComponent(registration._id)}`,
      { state: { editRegistration: registration } },
    );
  };

  const isLoading =
    registrationsQuery.isLoading ||
    teamsQuery.isLoading ||
    eventsQuery.isLoading ||
    activeRallyQuery.isLoading;

  return (
    <div className={cn(PAGE_SHELL, SIDEBAR_PAGE_PADDING, "gap-4")}>
      <PageHeader title="My entries" description={description} />

      <div className={cn(TABLE_SECTION, "min-h-0")}>
        <Card className={cn(surface, "rounded-md")}>
          <CrudTableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search entries..."
            filters={
              <Select
                value={resolvedEventFilter}
                onValueChange={(value) => setEventFilter(value)}
              >
                <SelectTrigger
                  aria-label="Filter by event"
                  className="h-11 w-full min-w-[200px] rounded-md border-[#E8E8E8] bg-white sm:w-[260px]"
                >
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EVENT_FILTER_ALL}>All events</SelectItem>
                  {events.map((event) => {
                    const id = getRallyEventId(event);
                    if (!id) return null;
                    const isActive = Boolean(activeEventId && id === activeEventId);
                    return (
                      <SelectItem key={id} value={id}>
                        {event.name}
                        {isActive ? " (Active)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            }
            addAction={
              <Button asChild variant="primary-outline" className="shrink-0">
                <Link to={ROUTES.REGISTRATION}>
                  <PlusIcon className="size-4" />
                  Register now
                </Link>
              </Button>
            }
          />

          <div className="space-y-6 px-6 py-6">
            {isLoading ? (
              <TeamsTableSkeleton rows={5} />
            ) : registrationsQuery.isError ? (
              <EmptyState
                icon={ClipboardListIcon}
                title="Could not load entries"
                description={
                  registrationsQuery.error?.message ??
                  "Something went wrong while fetching your registrations."
                }
                variant="error"
                size="compact"
              />
            ) : registrations.length === 0 ? (
              <EmptyState
                icon={ClipboardListIcon}
                title="No entries yet"
                description="Register for a rally to see your entry here."
                action={
                  <Button asChild>
                    <Link to={ROUTES.REGISTRATION}>
                      <PlusIcon className="size-4" />
                      Register now
                    </Link>
                  </Button>
                }
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={ClipboardListIcon}
                title="No matching entries"
                description={
                  search.trim()
                    ? "Try a different search term or event filter."
                    : `You have no entries for ${selectedEventName}.`
                }
                size="compact"
              />
            ) : (
              <TeamsDataTable tableClassName="table-fixed">
                <TeamsDataTableHeader>
                  <TeamsDataTableHeaderRow>
                    <TeamsDataTableHead className="w-[18%]">
                      Team
                    </TeamsDataTableHead>
                    <TeamsDataTableHead className="w-[10%]">
                      Number
                    </TeamsDataTableHead>
                    <TeamsDataTableHead className="w-[16%]">
                      Category
                    </TeamsDataTableHead>
                    <TeamsDataTableHead className="w-[16%]">
                      Navigator
                    </TeamsDataTableHead>
                    <TeamsDataTableHead className="w-[12%]">
                      Status
                    </TeamsDataTableHead>
                    <TeamsDataTableHead className="w-[16%]">
                      Registered
                    </TeamsDataTableHead>
                    <TeamsDataTableHead className="w-[12%] text-right">
                      Actions
                    </TeamsDataTableHead>
                  </TeamsDataTableHeaderRow>
                </TeamsDataTableHeader>
                <TeamsDataTableBody>
                  {filtered.map((r) => {
                    const team = resolveRegistrationTeam(r, teams);
                    const navigator = resolveRegistrationNavigator(r, team);
                    const rally = resolveRallyForRegistration(r);
                    const updateGate = canUpdateRegistration(r, rally);
                    return (
                      <TableRow key={r._id}>
                        <TableCell className="max-w-0 px-3 font-semibold text-[#1F1838]">
                          <span
                            className="block truncate"
                            title={team?.team_name}
                          >
                            {team?.team_name ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 font-medium text-[#1F1838]">
                          {team?.team_number ? `#${team.team_number}` : "—"}
                        </TableCell>
                        <TableCell className="max-w-0 px-3 text-[#6B7890]">
                          <span className="block truncate">
                            {getRegistrationCategoryLabel(r)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-0 px-3 text-[#6B7890]">
                          <span className="block truncate">
                            {getPersonName(navigator)}
                          </span>
                        </TableCell>
                        <TableCell className="px-3">
                          <span
                            className={cn(
                              "inline-flex rounded-md border px-2 py-0.5 text-[12px] font-medium",
                              registrationStatusTone(r.status),
                            )}
                          >
                            {formatRegistrationStatus(r.status)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-0 px-3 text-[#6B7890]">
                          <span className="block truncate">
                            {formatRegisteredAt(r.registered_at)}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="View entry details"
                              className="text-muted-foreground"
                              onClick={() => setDetail(r)}
                            >
                              <EyeIcon className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Update entry"
                              aria-disabled={!updateGate.ok}
                              className={cn(
                                "text-muted-foreground",
                                !updateGate.ok && "opacity-40",
                              )}
                              onClick={() => handleUpdateClick(r)}
                            >
                              <PencilIcon className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TeamsDataTableBody>
              </TeamsDataTable>
            )}
          </div>
        </Card>
      </div>

      <RegistrationDetailDialog
        registration={detail}
        teams={teams}
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      />
    </div>
  );
}

function RegistrationDetailDialog({
  registration,
  teams,
  open,
  onOpenChange,
}: {
  registration: DriverRegistration | null;
  teams: Team[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!registration) {
    return (
      <DialogCommon
        open={open}
        onOpenChange={onOpenChange}
        headerTitle="Entry details"
      >
        <Typography variant="body-sm" className="text-[#6B7890]">
          No entry selected.
        </Typography>
      </DialogCommon>
    );
  }

  const team = resolveRegistrationTeam(registration, teams);
  const navigator = resolveRegistrationNavigator(registration, team);
  const members = team?.member_ids ?? [];

  return (
    <DialogCommon
      open={open}
      onOpenChange={onOpenChange}
      headerTitle="Entry details"
      headerDescription="Full details for this rally registration."
      className="sm:max-w-[560px]"
    >
      <div className="space-y-4 text-[14px]">
        <DetailRow label="Status">
          <span
            className={cn(
              "inline-flex rounded-md border px-2 py-0.5 text-[12px] font-medium",
              registrationStatusTone(registration.status),
            )}
          >
            {formatRegistrationStatus(registration.status)}
          </span>
        </DetailRow>
        <DetailRow label="Team">{team?.team_name ?? "—"}</DetailRow>
        <DetailRow label="Team number">
          {team?.team_number ? `#${team.team_number}` : "—"}
        </DetailRow>
        <DetailRow label="Category">
          {getRegistrationCategoryLabel(registration)}
        </DetailRow>
        <DetailRow label="Navigator">
          {getPersonName(navigator)}
        </DetailRow>
        <DetailRow label="Registered">
          {formatRegisteredAt(registration.registered_at)}
        </DetailRow>
        <DetailRow label="Members">
          {members.length === 0 ? (
            "—"
          ) : (
            <ul className="list-disc space-y-1 pl-4 text-[#1F1838]">
              {members.map((m) => (
                <li key={m._id}>
                  {m.name}
                  {m.email ? (
                    <span className="text-[#6B7890]"> · {m.email}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </DetailRow>
      </div>
    </DialogCommon>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-3">
      <Typography
        as="span"
        variant="label"
        className="text-[12px] tracking-wide text-[#8A95B5] uppercase"
      >
        {label}
      </Typography>
      <div className="min-w-0 text-[#1F1838]">{children}</div>
    </div>
  );
}
