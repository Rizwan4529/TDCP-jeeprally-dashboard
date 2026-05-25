import type { CategoryRecord } from "@/api/types/categories";

export function needsRosterMembers(cat: CategoryRecord | undefined): boolean {
  return (cat?.max_members ?? 0) > 0;
}

export function needsNavigator(cat: CategoryRecord | undefined): boolean {
  return Boolean(cat?.navigator_allowed && (cat?.max_members ?? 0) > 0);
}

export type TeamRosterValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateTeamRoster(
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

  if (memberIds.length === 0) {
    return {
      ok: false,
      message: "Add users on the Users tab, then select them for this team.",
    };
  }

  if (memberIds.length > max) {
    return {
      ok: false,
      message: `Select at most ${max} team member${max === 1 ? "" : "s"} for this category.`,
    };
  }

  if (cat.navigator_allowed) {
    if (!navigatorId) {
      return { ok: false, message: "Select a navigator from the chosen team members." };
    }
    if (!memberIds.includes(navigatorId)) {
      return {
        ok: false,
        message: "Navigator must be one of the selected team members.",
      };
    }
  } else if (navigatorId) {
    return { ok: false, message: "This category does not allow a navigator." };
  }

  return { ok: true };
}

export function buildCategoryMap(
  categories: CategoryRecord[],
): Map<string, CategoryRecord> {
  return new Map(categories.map((c) => [c.key, c]));
}

/** Merge existing team member ids with newly selected user ids, respecting category max. */
export function mergeTeamMemberIds(
  existing: string[],
  incoming: string[],
  maxMembers: number,
): { ok: true; ids: string[] } | { ok: false; message: string } {
  const merged = [...existing];
  for (const id of incoming) {
    if (!merged.includes(id)) merged.push(id);
  }

  if (maxMembers === 0) {
    if (incoming.length > 0) {
      return {
        ok: false,
        message: "This category does not allow team members.",
      };
    }
    return { ok: true, ids: [] };
  }

  if (merged.length > maxMembers) {
    return {
      ok: false,
      message: `This team allows at most ${maxMembers} member${maxMembers === 1 ? "" : "s"}. Remove members or pick fewer users.`,
    };
  }

  return { ok: true, ids: merged };
}
