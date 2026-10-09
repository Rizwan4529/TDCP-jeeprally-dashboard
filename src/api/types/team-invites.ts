export type TeamInviteStatus = "pending" | "accepted" | "declined" | "cancelled";

export type TeamInviteTeam = {
  _id: string;
  event_id?: string | null;
  driver_id?: string | null;
  /** Only present once the invite has been accepted. */
  co_driver_id?: string | null;
  team_name: string;
  team_number: string;
  category: string;
};

export type TeamInviteDriver = {
  _id: string;
  name: string;
  email: string;
  profile_image?: string | null;
  contact_number?: string | null;
};

export type TeamInviteCoDriver = TeamInviteDriver & {
  cnic?: string | null;
  role?: string | null;
};

export type TeamInvite = {
  _id: string;
  team_id: TeamInviteTeam | null;
  driver_id: TeamInviteDriver | null;
  co_driver_id: TeamInviteCoDriver | null;
  status: TeamInviteStatus;
  created_at?: string;
  updated_at?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type GetMyInvitesResponse = ApiResponse<TeamInvite[]>;
export type RespondToInviteResponse = ApiResponse<unknown>;
