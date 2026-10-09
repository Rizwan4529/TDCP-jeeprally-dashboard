import { z } from "zod";

import type { CreateTeamPayload, Team, UpdateTeamPayload } from "@/api/types/teams";
import type { Category as TeamCategory } from "@/utils/constants";

export const teamFormSchema = z.object({
  team_name: z.string().trim().min(1, "Team name is required"),
  team_number: z.string().trim().min(1, "Team number is required"),
  category: z.string().trim().min(1, "Category is required"),
  type: z.string().trim().optional(),
  navigator_id: z.string().optional(),
  co_driver_email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Enter a valid email address",
    }),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;

export const emptyTeamFormValues: TeamFormValues = {
  team_name: "",
  team_number: "",
  category: "",
  type: "",
  navigator_id: "",
  co_driver_email: "",
};

export function teamToFormValues(t: Team): TeamFormValues {
  return {
    team_name: t.team_name,
    team_number: t.team_number,
    category: t.category,
    navigator_id: t.navigator_id?._id ?? "",
    co_driver_email: "",
  };
}

/** Accepted co-driver (new invite flow) or a legacy navigator. */
export function coDriverFromTeam(t: Team) {
  return t.co_driver_id ?? t.navigator_id ?? null;
}

/** Team-dialog create: details + optional co-driver invite for the given event. */
export function buildCreateTeamWithInvitePayload(
  values: TeamFormValues,
  eventId: string | undefined,
): CreateTeamPayload {
  const payload: CreateTeamPayload = {
    team_name: values.team_name.trim(),
    team_number: values.team_number.trim(),
    category: values.category,
  };
  const type = values.type?.trim();
  if (type) payload.type = type;
  if (eventId) payload.event_id = eventId;
  const email = values.co_driver_email?.trim();
  if (email) payload.co_driver_email = email;
  return payload;
}

/** Team-dialog edit: only the details; the co-driver changes through invites. */
export function buildTeamDetailsUpdatePayload(
  values: TeamFormValues,
): UpdateTeamPayload {
  const payload: UpdateTeamPayload = {
    team_name: values.team_name.trim(),
    team_number: values.team_number.trim(),
    category: values.category,
  };
  const type = values.type?.trim();
  if (type) payload.type = type;
  return payload;
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
