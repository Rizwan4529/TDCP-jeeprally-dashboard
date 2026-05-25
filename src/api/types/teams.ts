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
    cnic_image?: string | null;
    license_image?: string | null;
    gender?: string | null;
    age?: string | number | null;
    cnic?: string | null;
    date_of_birth?: string | null;
    license_number?: string | null;
    license_expiry?: string | null;
  } | null;
  member_ids: TeamMemberEmbed[];
  navigator_id: TeamMemberEmbed | null;
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
  category: TeamCategory;
  member_ids?: string[];
  navigator_id?: string;
};

export type UpdateTeamPayload = Partial<{
  team_name: string;
  team_number: string;
  category: TeamCategory;
  member_ids: string[];
  navigator_id: string | null;
}>;

export type UpsertTeamResponse = ApiResponse<Team>;

export type DeleteTeamResponse = ApiResponse<null>;
