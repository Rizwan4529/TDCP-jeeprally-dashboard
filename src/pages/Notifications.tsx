import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangleIcon,
  BellIcon,
  CheckIcon,
  MailIcon,
  PhoneIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { DialogCommon } from "@/components/common/DialogCommon";
import {
  ButtonSpinner,
  EmptyState,
  PanelBlockSkeleton,
} from "@/components/common/LoadingStates";
import { PageHeader } from "@/components/common/NavigationCommon";
import { Typography } from "@/components/common/Typography";
import {
  SCROLL_PAGE,
  SIDEBAR_PAGE_PADDING,
} from "@/components/layout/pageLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TeamInvite } from "@/api/types/team-invites";
import { useSessionUser } from "@/hooks/api/use-session-user";
import {
  useAcceptInviteMutation,
  useDeclineInviteMutation,
} from "@/hooks/api/use-team-invites";
import { useInviteNotifications } from "@/hooks/use-invite-notifications";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants";
import { toPublicFileUrl } from "@/utils/helpers";
import {
  formatInviteCategory,
  formatInviteDate,
  formatInviteTeam,
  inviteStatusTone,
  isPendingInvite,
} from "@/utils/invite-notifications";
import { getCompetitorProfileGaps } from "@/utils/registration-eligibility";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

function initialsFromName(name: string | undefined) {
  if (!name?.trim()) return "JR";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function NotificationsPage() {
  return <NotificationsScreen />;
}

function NotificationsScreen() {
  const { invitesQuery, invites, pendingInvites, markAllSeen } =
    useInviteNotifications();
  const { data: sessionUser } = useSessionUser();
  const acceptMutation = useAcceptInviteMutation();
  const declineMutation = useDeclineInviteMutation();
  const [declineTarget, setDeclineTarget] = useState<TeamInvite | null>(null);

  // Everything visible on this page counts as seen (clears the sidebar dot).
  useEffect(() => {
    markAllSeen();
  }, [markAllSeen]);

  const historyInvites = useMemo(
    () => invites.filter((invite) => !isPendingInvite(invite)),
    [invites],
  );

  const latestAccepted = useMemo(
    () => invites.find((invite) => invite.status === "accepted") ?? null,
    [invites],
  );
  const profileGaps = useMemo(
    () => (sessionUser ? getCompetitorProfileGaps(sessionUser) : []),
    [sessionUser],
  );

  const busyInviteId =
    (acceptMutation.isPending && acceptMutation.variables) ||
    (declineMutation.isPending && declineMutation.variables) ||
    null;

  const handleAccept = (invite: TeamInvite) => {
    acceptMutation.mutate(invite._id, {
      onSuccess: (res) => {
        toast.success(
          res?.message || `You joined ${formatInviteTeam(invite)} as co-driver.`,
        );
      },
      onError: (err) => toast.error(err.message || "Could not accept invite."),
    });
  };

  const handleConfirmDecline = () => {
    if (!declineTarget) return;
    const invite = declineTarget;
    declineMutation.mutate(invite._id, {
      onSuccess: (res) => {
        toast.success(res?.message || "Invite declined.");
        setDeclineTarget(null);
      },
      onError: (err) => {
        toast.error(err.message || "Could not decline invite.");
        setDeclineTarget(null);
      },
    });
  };

  return (
    <div className={cn(SCROLL_PAGE, SIDEBAR_PAGE_PADDING, "gap-5")}>
      <PageHeader
        title="Notifications"
        description="Team invites from other drivers. Accept to join their team as co-driver."
      />

      {latestAccepted && profileGaps.length > 0 ? (
        <ProfileIncompleteBanner
          teamLabel={formatInviteTeam(latestAccepted)}
          gaps={profileGaps}
        />
      ) : null}

      {invitesQuery.isPending ? (
        <div className="space-y-3">
          <PanelBlockSkeleton lines={3} />
          <PanelBlockSkeleton lines={3} />
        </div>
      ) : invitesQuery.isError ? (
        <EmptyState
          icon={AlertTriangleIcon}
          variant="error"
          title="Could not load notifications"
          description={invitesQuery.error.message}
          action={
            <Button variant="outline" onClick={() => void invitesQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : invites.length === 0 ? (
        <EmptyState
          icon={BellIcon}
          title="No notifications yet"
          description="When a driver invites you to their team, it will show up here."
        />
      ) : (
        <>
          <section className="space-y-3">
            <SectionTitle title="Pending invites" count={pendingInvites.length} />
            {pendingInvites.length === 0 ? (
              <Typography variant="body-sm" className="text-[#6B7890]">
                You're all caught up. No invites waiting for a response.
              </Typography>
            ) : (
              pendingInvites.map((invite) => (
                <InviteCard
                  key={invite._id}
                  invite={invite}
                  busy={busyInviteId === invite._id}
                  disabled={Boolean(busyInviteId)}
                  onAccept={() => handleAccept(invite)}
                  onDecline={() => setDeclineTarget(invite)}
                />
              ))
            )}
          </section>

          {historyInvites.length > 0 ? (
            <section className="space-y-3">
              <SectionTitle title="History" count={historyInvites.length} />
              {historyInvites.map((invite) => (
                <InviteCard key={invite._id} invite={invite} />
              ))}
            </section>
          ) : null}
        </>
      )}

      <DialogCommon
        open={Boolean(declineTarget)}
        onOpenChange={(open) => {
          if (!open && !declineMutation.isPending) setDeclineTarget(null);
        }}
        headerTitle="Decline invite?"
        headerDescription={
          declineTarget
            ? `${declineTarget.driver_id?.name ?? "The driver"} will be told you declined joining ${formatInviteTeam(declineTarget)}.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            disabled={declineMutation.isPending}
            onClick={() => setDeclineTarget(null)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={declineMutation.isPending}
            onClick={handleConfirmDecline}
          >
            {declineMutation.isPending ? <ButtonSpinner /> : null}
            Decline
          </Button>
        </div>
      </DialogCommon>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <Typography as="h2" variant="h6" className="text-[#1F1838]">
        {title}
      </Typography>
      <span className="rounded-full bg-[#F4F5F8] px-2 py-0.5 text-xs font-medium text-[#6B7890]">
        {count}
      </span>
    </div>
  );
}

function InviteCard({
  invite,
  busy = false,
  disabled = false,
  onAccept,
  onDecline,
}: {
  invite: TeamInvite;
  busy?: boolean;
  disabled?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const driver = invite.driver_id;
  const team = invite.team_id;
  const imageUrl = toPublicFileUrl(driver?.profile_image);
  const pending = isPendingInvite(invite);
  const sentAt = formatInviteDate(invite.created_at);

  return (
    <Card className={cn(surface, "rounded-md p-4 sm:p-5")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-11 shrink-0 border-2 border-primary/20">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={driver?.name ?? "Driver"} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {initialsFromName(driver?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <Typography variant="body" className="text-[#1F1838]">
              <span className="font-semibold">{driver?.name ?? "A driver"}</span>{" "}
              invited you to join{" "}
              <span className="font-semibold">{team?.team_name ?? "their team"}</span>
              {team?.team_number ? ` · #${team.team_number}` : ""}
            </Typography>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7890]">
              <span>Category: {formatInviteCategory(team?.category)}</span>
              {driver?.email ? (
                <span className="inline-flex items-center gap-1">
                  <MailIcon className="size-3.5" />
                  {driver.email}
                </span>
              ) : null}
              {driver?.contact_number ? (
                <span className="inline-flex items-center gap-1">
                  <PhoneIcon className="size-3.5" />
                  {driver.contact_number}
                </span>
              ) : null}
              {sentAt ? <span>Sent {sentAt}</span> : null}
            </div>
          </div>
        </div>

        {pending ? (
          <div className="flex shrink-0 gap-2 sm:justify-end">
            <Button variant="outline" disabled={disabled} onClick={onDecline}>
              <XIcon className="size-4" />
              Decline
            </Button>
            <Button disabled={disabled} onClick={onAccept}>
              {busy ? <ButtonSpinner /> : <CheckIcon className="size-4" />}
              Accept
            </Button>
          </div>
        ) : (
          <span
            className={cn(
              "w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize",
              inviteStatusTone(invite.status),
            )}
          >
            {invite.status}
          </span>
        )}
      </div>
    </Card>
  );
}

function ProfileIncompleteBanner({
  teamLabel,
  gaps,
}: {
  teamLabel: string;
  gaps: string[];
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-[#F0DFA8] bg-[#FFF8E8] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-[#9A6B00]" />
        <div className="space-y-1">
          <Typography variant="body" className="font-semibold text-[#6B4A00]">
            You're a co-driver on {teamLabel}. Complete your profile so the team can register.
          </Typography>
          <Typography variant="body-sm" className="text-[#9A6B00]">
            Missing: {gaps.join(", ")}
          </Typography>
        </div>
      </div>
      <Button asChild variant="primary-outline" className="shrink-0">
        <Link to={ROUTES.PROFILE_EDIT}>Complete profile</Link>
      </Button>
    </div>
  );
}
