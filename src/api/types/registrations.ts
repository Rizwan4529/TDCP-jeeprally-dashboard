/** POST /registrations — send the category document `_id` from GET /categories. */
export type CreateRegistrationPayload = {
  team_id: string;
  event_id: string;
  category_id: string;
  vehicle_id: string;
  challenge_id?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CreateRegistrationResponse = ApiResponse<unknown>;

