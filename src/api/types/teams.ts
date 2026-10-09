import type { Category } from "@/utils/constants";

export type TeamCategory = Category;

export type TeamMemberEmbed = {
  _id: string;
  name: string;
  email: string;
  contact_number: string;
  cnic: string;
  date_of_birth: string;
  occupation?: string | null;
  location?: string | null;
  profile_image?: string | null;
};

export type Team = {
  _id: string;
  driver_id?: {
    _id: string;
    name: string;
    email: string;
    contact_number: string;
    occupation?: string | null;
    location?: string | null;
    address?: string | null;
    profile_image?: string | null;
    cnic_front_image?: string | null;
    cnic_back_image?: string | null;
    license_front_image?: string | null;
    license_back_image?: string | null;
    gender?: string | null;
    age?: string | number | null;
    cnic?: string | null;
    date_of_birth?: string | null;
    license_number?: string | null;
    license_expiry?: string | null;
  } | null;
  member_ids: TeamMemberEmbed[];
  navigator_id: TeamMemberEmbed | null;
  /** Set once an invited co-driver accepts. */
  co_driver_id?: TeamMemberEmbed | null;
  /** my-teams populates this with the event (`{ _id, name, … }`). */
  event_id?: string | { _id: string; name?: string } | null;
  /** Vehicle type key (my-teams returns e.g. "premium"), id, or populated type. */
  type?: string | { _id: string; name?: string } | null;
  team_name: string;
  team_number: string;
  category: TeamCategory;
  created_at?: string;
  updated_at?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type GetMyTeamsResponse = ApiResponse<Team[]>;

/** @deprecated Use GetMyTeamsResponse */
export type GetMyTeamResponse = GetMyTeamsResponse;

export type CreateTeamPayload = {
  team_name: string;
  team_number: string;
  /** Category key (legacy) or the active rally's category id. */
  category: TeamCategory | string;
  /** Active rally type id. */
  type?: string;
  member_ids?: string[];
  navigator_id?: string;
  event_id?: string;
  /** Invites a registered competitor; the invite stays pending until they respond. */
  co_driver_email?: string;
  co_driver_id?: string;
};

export type InviteCoDriverPayload =
  | { co_driver_email: string; co_driver_id?: never }
  | { co_driver_id: string; co_driver_email?: never };

export type InviteCoDriverResponse = ApiResponse<unknown>;

export type UpdateTeamPayload = Partial<{
  team_name: string;
  team_number: string;
  category: TeamCategory | string;
  type: string;
  member_ids: string[];
  navigator_id: string | null;
}>;

export type UpsertTeamResponse = ApiResponse<Team>;

export type DeleteTeamResponse = ApiResponse<null>;
