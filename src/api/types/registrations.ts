/** POST /registrations — send the category document `_id` from GET /rally/:eventId/pricing. */
export type CreateRegistrationPayload = {
  team_id: string;
  event_id: string;
  category_id: string;
  vehicle_id: string;
  challenge_id?: string;
};

/** PUT /registrations/:id — category and event stay locked; no payment. */
export type UpdateRegistrationPayload = {
  team_id: string;
  vehicle_id: string;
  challenge_id?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CreateRegistrationResponse = ApiResponse<unknown>;
export type UpdateRegistrationResponse = ApiResponse<DriverRegistration>;
export type GetRegistrationByIdResponse = ApiResponse<DriverRegistration>;

export type RegistrationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "withdrawn";

export type RegistrationPerson = {
  _id: string;
  name: string;
  email?: string;
  contact_number?: string;
  cnic?: string;
  date_of_birth?: string;
  occupation?: string;
  location?: string;
  profile_image?: string | null;
};

export type RegistrationTeam = {
  _id: string;
  team_name: string;
  team_number: string;
  category: string;
  driver_id?: RegistrationPerson | string | null;
  navigator_id?: RegistrationPerson | string | null;
  member_ids?: RegistrationPerson[];
};

export type RegistrationCategory = {
  _id: string;
  title: string;
  key: string;
  image?: string | null;
  description?: string | null;
  max_members?: number;
  navigator_allowed?: boolean;
  consent?: string | null;
};

/** GET /rally/:eventId/registrations — driver sees own teams' entries. */
export type DriverRegistration = {
  _id: string;
  event_id: string | { _id: string; name?: string };
  team_id: RegistrationTeam | string | null;
  category_id: RegistrationCategory | string | null;
  vehicle_id?:
    | string
    | {
        _id: string;
        model?: string;
        engine?: string;
        team_id?: string | null;
      }
    | null;
  navigator_id?: string | RegistrationPerson | null;
  challenge_id?: string | null;
  status: RegistrationStatus | string;
  registered_at?: string;
  updated_at?: string;
  __v?: number;
};

export type GetEventRegistrationsResponse = ApiResponse<DriverRegistration[]>;
