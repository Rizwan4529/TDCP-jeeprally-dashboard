import type { TeamCategory } from "@/api/types/teams";

/** Vehicle race category — same enum as team category. */
export type VehicleCategory = TeamCategory;

export type Vehicle = {
  _id: string;
  team_id?: string;
  model: string;
  engine: string;
  category: VehicleCategory;
  frame?: string;
  power?: number;
  weight?: number;
  length?: number;
  tank_capacity?: number;
  class?: string | null;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
  __v?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

/** `GET /vehicles/my-vehicles` — `data` is an array (may be empty). */
export type GetMyVehiclesResponse = ApiResponse<Vehicle[]>;

/** @deprecated Use GetMyVehiclesResponse */
export type GetMyVehicleResponse = GetMyVehiclesResponse;

/** POST /vehicles */
export type CreateVehiclePayload = {
  model: string;
  engine: string;
  category: VehicleCategory;
  frame?: string;
  power?: number;
  weight?: number;
  length?: number;
  tank_capacity?: number;
  class?: string;
  image?: string;
};

/** PUT /vehicles/:id — any subset of allowed fields (≥1). */
export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

/** @deprecated Use CreateVehiclePayload */
export type UpsertVehiclePayload = CreateVehiclePayload;

export type UpsertVehicleResponse = ApiResponse<Vehicle>;

export type DeleteVehicleResponse = ApiResponse<null>;

export type UploadVehicleImageResponse = ApiResponse<Vehicle>;
