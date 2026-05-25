import { z } from "zod";

import type { CreateTeamPayload, Team, UpdateTeamPayload } from "@/api/types/teams";
import type { Category as TeamCategory } from "@/utils/constants";

export const teamFormSchema = z.object({
  team_name: z.string().trim().min(1, "Team name is required"),
  team_number: z.string().trim().min(1, "Team number is required"),
  category: z.string().trim().min(1, "Category is required"),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;

export const emptyTeamFormValues: TeamFormValues = {
  team_name: "",
  team_number: "",
  category: "",
};

export function teamToFormValues(t: Team): TeamFormValues {
  return {
    team_name: t.team_name,
    team_number: t.team_number,
    category: t.category,
  };
}

export function teamMemberIdsFromTeam(t: Team): string[] {
  return (t.member_ids ?? []).map((m) => m._id);
}

export function navigatorIdFromTeam(t: Team): string {
  return t.navigator_id?._id ?? "";
}

/** Member ids for the team form, ensuring navigator is included when set. */
export function selectedMembersForTeamForm(t: Team): {
  memberIds: string[];
  navigatorId: string;
} {
  const memberIds = teamMemberIdsFromTeam(t);
  const navigatorId = navigatorIdFromTeam(t);
  if (navigatorId && !memberIds.includes(navigatorId)) {
    return { memberIds: [...memberIds, navigatorId], navigatorId };
  }
  return { memberIds, navigatorId };
}

export function buildCreateTeamPayload(
  values: TeamFormValues,
  memberIds: string[],
  navigatorId: string | undefined,
): CreateTeamPayload {
  const payload: CreateTeamPayload = {
    team_name: values.team_name.trim(),
    team_number: values.team_number.trim(),
    category: values.category as TeamCategory,
    member_ids: memberIds,
  };
  if (navigatorId) payload.navigator_id = navigatorId;
  return payload;
}

export function buildUpdateTeamPayload(
  values: TeamFormValues,
  memberIds: string[],
  navigatorId: string | undefined | null,
): UpdateTeamPayload {
  const payload: UpdateTeamPayload = {
    team_name: values.team_name.trim(),
    team_number: values.team_number.trim(),
    category: values.category as TeamCategory,
    member_ids: memberIds,
  };
  if (navigatorId) {
    payload.navigator_id = navigatorId;
  } else {
    payload.navigator_id = null;
  }
  return payload;
}
