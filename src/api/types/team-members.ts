export type TeamMember = {
  _id: string;
  driver_id: string;
  name: string;
  email: string;
  contact_number: string;
  cnic: string;
  date_of_birth: string;
  occupation?: string | null;
  location?: string | null;
  profile_image?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type GetTeamMembersResponse = ApiResponse<TeamMember[]>;
export type GetTeamMemberResponse = ApiResponse<TeamMember>;
export type UpsertTeamMemberResponse = ApiResponse<TeamMember>;
export type DeleteTeamMemberResponse = ApiResponse<null>;

export type CreateTeamMemberPayload = {
  name: string;
  email: string;
  contact_number: string;
  cnic: string;
  date_of_birth: string;
  occupation?: string;
  location?: string;
  profile_image?: File;
};

export type UpdateTeamMemberPayload = Partial<CreateTeamMemberPayload>;
