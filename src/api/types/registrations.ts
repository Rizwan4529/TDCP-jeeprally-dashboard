import type { Category } from "@/utils/constants";

/** POST /registrations — team.category must match `category`; navigator rules apply per category. */
export type CreateRegistrationPayload = {
  team_id: string;
  event_id: string;
  category: Category;
  vehicle_id: string;
  /** Omit for dirt_bike / quad_bike (must not be sent). Required for other categories. */
  navigator_id?: string;
  challenge_id?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CreateRegistrationResponse = ApiResponse<unknown>;

