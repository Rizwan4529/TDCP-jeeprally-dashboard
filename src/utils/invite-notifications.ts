import type { TeamInvite } from "@/api/types/team-invites";
import { CATEGORY_LABELS, type Category } from "@/utils/constants";

const SEEN_STORAGE_PREFIX = "seen_team_invites:";

const EMPTY_SEEN: ReadonlySet<string> = new Set();

/** Snapshot cache so useSyncExternalStore gets a stable reference per user. */
const seenCache = new Map<string, ReadonlySet<string>>();
const listeners = new Set<() => void>();

function readSeen(userId: string): ReadonlySet<string> {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_PREFIX + userId);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? new Set(parsed.filter((id): id is string => typeof id === "string"))
      : EMPTY_SEEN;
  } catch {
    return EMPTY_SEEN;
  }
}

export function getSeenInviteIds(userId: string | undefined): ReadonlySet<string> {
  if (!userId) return EMPTY_SEEN;
  let seen = seenCache.get(userId);
  if (!seen) {
    seen = readSeen(userId);
    seenCache.set(userId, seen);
  }
  return seen;
}

/** Marks invites as seen for this user; storage failures keep the in-memory value. */
export function markInvitesSeen(userId: string | undefined, inviteIds: string[]) {
  if (!userId || inviteIds.length === 0) return;
  const current = getSeenInviteIds(userId);
  if (inviteIds.every((id) => current.has(id))) return;

  const next = new Set([...current, ...inviteIds]);
  seenCache.set(userId, next);
  try {
    localStorage.setItem(SEEN_STORAGE_PREFIX + userId, JSON.stringify([...next]));
  } catch {
    // Storage unavailable (private mode, blocked): the dot just comes back on reload.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeSeenInvites(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isPendingInvite(invite: TeamInvite): boolean {
  return invite.status === "pending";
}

export function formatInviteCategory(key: string | undefined): string {
  if (!key) return "-";
  const known = CATEGORY_LABELS[key as Category];
  if (known) return known;
  return key
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatInviteTeam(invite: TeamInvite): string {
  const team = invite.team_id;
  if (!team) return "a team";
  return team.team_number
    ? `${team.team_name} (#${team.team_number})`
    : team.team_name;
}

export function formatInviteDate(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function inviteStatusTone(status: string | undefined): string {
  switch (status) {
    case "pending":
      return "bg-[#FFF8E8] text-[#9A6B00] border-[#F0DFA8]";
    case "accepted":
      return "bg-primary/10 text-primary border-primary/25";
    case "declined":
      return "bg-[#FFF5F5] text-[#B91C1C] border-[#F2D6D6]";
    default:
      return "bg-[#F4F5F8] text-[#6B7890] border-[#E8E8E8]";
  }
}
