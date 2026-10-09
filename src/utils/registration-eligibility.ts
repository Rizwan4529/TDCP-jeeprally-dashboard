import type { LoginUser } from "@/api/types/auth";
import type { CategoryRecord } from "@/api/types/categories";
import type { Team } from "@/api/types/teams";
import { refId } from "@/utils/rally-team-options";
import { coDriverFromTeam } from "@/utils/team-form";
import {
  needsNavigator,
  type TeamRosterValidationResult,
} from "@/utils/team-roster-rules";
import {
  PROFILE_IMAGE_FIELDS,
  type ProfileImageField,
} from "@/utils/profile-update";

const PROFILE_IMAGE_KEYS = new Set<string>(PROFILE_IMAGE_FIELDS.map((f) => f.key));

function hasText(value: string | number | null | undefined): boolean {
  if (value == null) return false;
  return String(value).trim().length > 0;
}

function hasUploadedFile(path: string | null | undefined): boolean {
  return hasText(path);
}

const PROFILE_FIELD_LABELS: { key: keyof LoginUser | "email"; label: string }[] = [
  { key: "name", label: "Full name" },
  { key: "gender", label: "Gender" },
  { key: "age", label: "Age" },
  { key: "address", label: "Address" },
  { key: "contact_number", label: "Cell number" },
  { key: "license_number", label: "Driving license" },
  { key: "license_expiry", label: "License expiry" },
  { key: "cnic", label: "CNIC" },
  { key: "email", label: "Email" },
  { key: "date_of_birth", label: "Date of birth" },
  { key: "occupation", label: "Occupation" },
  ...PROFILE_IMAGE_FIELDS,
];

export function getCompetitorProfileGaps(user: LoginUser): string[] {
  const gaps: string[] = [];

  for (const { key, label } of PROFILE_FIELD_LABELS) {
    if (PROFILE_IMAGE_KEYS.has(key)) {
      if (!hasUploadedFile(user[key as ProfileImageField])) gaps.push(label);
    } else if (key === "age") {
      if (!hasText(user.age)) gaps.push(label);
    } else {
      const value = user[key as keyof LoginUser];
      if (typeof value === "string" && !hasText(value)) gaps.push(label);
      else if (value == null) gaps.push(label);
    }
  }

  return gaps;
}

export function isCompetitorProfileComplete(user: LoginUser | null | undefined): boolean {
  if (!user) return false;
  return getCompetitorProfileGaps(user).length === 0;
}

/** Everyone on the team besides the driver: the co-driver plus any extra members. */
function getTeamMates(team: Team): { _id: string; name: string }[] {
  const driverId = team.driver_id?._id;
  const byId = new Map<string, { _id: string; name: string }>();
  const coDriver = coDriverFromTeam(team);
  if (coDriver?._id) byId.set(coDriver._id, coDriver);
  for (const member of team.member_ids ?? []) {
    if (member?._id && !byId.has(member._id)) byId.set(member._id, member);
  }
  if (driverId) byId.delete(driverId);
  return [...byId.values()];
}

/** Team-mate ids (co-driver included), excluding the driver. */
export function getTeamMemberIds(team: Team): string[] {
  return getTeamMates(team).map((m) => m._id);
}

export function getTeamMemberNames(team: Team): string[] {
  return getTeamMates(team).map((m) => m.name);
}

/** Teams store the category as a key (legacy) or as the rally category id. */
export function teamMatchesCategory(
  team: Team,
  category: { _id?: string; key?: string } | undefined,
): boolean {
  if (!category) return false;
  const value = String(team.category ?? "");
  return Boolean(value) && (value === category.key || value === category._id);
}

/** Legacy teams have no event; new teams must belong to the given event. */
export function teamBelongsToEvent(team: Team, eventId: string | undefined): boolean {
  const teamEventId = refId(team.event_id);
  return !teamEventId || !eventId || teamEventId === eventId;
}

/**
 * Profile gaps for a co-driver, judged on the profile fields the teams API
 * actually returns for them (fields it doesn't send can't be verified here).
 */
export function getCoDriverProfileGaps(person: object): string[] {
  const record = person as Record<string, unknown>;
  const gaps: string[] = [];
  for (const { key, label } of PROFILE_FIELD_LABELS) {
    if (!(key in record)) continue;
    const value = record[key];
    if (typeof value === "number") continue;
    if (typeof value !== "string" || !value.trim()) gaps.push(label);
  }
  return gaps;
}

/** Registration-only: checks the team's co-driver and roster against the category. */
export function validateTeamForRegistration(
  cat: CategoryRecord | undefined,
  team: Team,
): TeamRosterValidationResult {
  if (!cat) {
    return { ok: false, message: "Select a category." };
  }

  const coDriver = coDriverFromTeam(team);
  const mates = getTeamMemberIds(team);

  if (needsNavigator(cat)) {
    if (!coDriver) {
      return {
        ok: false,
        message: `${team.team_name} has no co-driver yet. Invite one from the Teams page. They need to accept before you can register.`,
      };
    }
    const gaps = getCoDriverProfileGaps(coDriver);
    if (gaps.length > 0) {
      return {
        ok: false,
        message: `Your co-driver ${coDriver.name} must complete their profile before you can register (missing: ${gaps.join(", ")}).`,
      };
    }
  } else if (coDriver) {
    return {
      ok: false,
      message: `${cat.title} doesn't allow a navigator, but ${team.team_name} has a co-driver. Choose a team without one.`,
    };
  }

  // max_members may or may not count the driver, so allow whichever is larger.
  const max = cat.max_members ?? 0;
  const allowedMates = Math.max(max - 1, needsNavigator(cat) ? 1 : 0);
  if (mates.length > allowedMates) {
    return {
      ok: false,
      message: `${team.team_name} has too many members for ${cat.title} (maximum ${allowedMates} besides you). Update the team on the Teams page.`,
    };
  }

  return { ok: true };
}

export function categoryRegistrationHint(cat: CategoryRecord): string {
  const max = cat.max_members ?? 0;
  if (max === 0) {
    return "Solo entry";
  }
  const parts = [`${max} member${max === 1 ? "" : "s"} required`];
  if (cat.navigator_allowed) {
    parts.push("Navigator required");
  }
  return parts.join(" · ");
}
