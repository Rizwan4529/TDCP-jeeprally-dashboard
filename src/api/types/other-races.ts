export type OtherRaceRole = "driver" | "navigator";

export type OtherRace = {
  _id: string;
  driver_id: string;
  team: string;
  position: string;
  vehicle: string;
  year: number;
  role: OtherRaceRole;
  created_at?: string;
  updated_at?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type GetOtherRacesResponse = ApiResponse<OtherRace[]>;

export type GetOtherRaceResponse = ApiResponse<OtherRace>;

export type CreateOtherRacePayload = {
  team: string;
  position: string;
  vehicle: string;
  year: number;
  role: OtherRaceRole;
};

export type UpdateOtherRacePayload = Partial<CreateOtherRacePayload>;

export type UpsertOtherRaceResponse = ApiResponse<OtherRace>;

export type DeleteOtherRaceResponse = ApiResponse<null>;
