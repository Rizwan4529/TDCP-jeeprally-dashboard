import type { LoginUser } from "@/api/types/auth";
import type { CategoryRecord } from "@/api/types/categories";
import type { Team } from "@/api/types/teams";
import type { TeamRosterValidationResult } from "@/utils/team-roster-rules";

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
  { key: "profile_image", label: "Driver's image" },
  { key: "cnic_image", label: "Driver's CNIC" },
  { key: "license_image", label: "Driver's license image" },
];

export function getCompetitorProfileGaps(user: LoginUser): string[] {
  const gaps: string[] = [];

  for (const { key, label } of PROFILE_FIELD_LABELS) {
    if (key === "profile_image" || key === "cnic_image" || key === "license_image") {
      if (!hasUploadedFile(user[key])) gaps.push(label);
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

export function getTeamMemberIds(team: Team): string[] {
  return (team.member_ids ?? []).map((m) => m._id);
}

/** Registration-only: full roster required when max_members > 0. */
export function validateTeamForRegistration(
  cat: CategoryRecord | undefined,
  memberIds: string[],
  navigatorId: string | undefined,
): TeamRosterValidationResult {
  if (!cat) {
    return { ok: false, message: "Select a category." };
  }

  const max = cat.max_members ?? 0;

  if (max === 0) {
    if (memberIds.length > 0) {
      return { ok: false, message: "This category does not allow team members." };
    }
    if (navigatorId) {
      return { ok: false, message: "This category does not allow a navigator." };
    }
    return { ok: true };
  }

  if (memberIds.length < max) {
    const missing = max - memberIds.length;
    return {
      ok: false,
      message: `This team needs ${max} member${max === 1 ? "" : "s"} for ${cat.title} (${missing} more required). Update the team on the Teams page.`,
    };
  }

  if (memberIds.length > max) {
    return {
      ok: false,
      message: `This team has too many members (maximum ${max} for ${cat.title}). Update the team on the Teams page.`,
    };
  }

  if (cat.navigator_allowed) {
    if (!navigatorId) {
      return {
        ok: false,
        message: "This team must have a navigator assigned. Update the team on the Teams page.",
      };
    }
    if (!memberIds.includes(navigatorId)) {
      return {
        ok: false,
        message: "Navigator must be one of the team's members.",
      };
    }
  } else if (navigatorId) {
    return { ok: false, message: "This category does not allow a navigator." };
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
