/** POST /registrations — keys match the registration API body. */
export type CreateRegistrationPayload = {
  /** Omitted for solo categories (max_members ≤ 1), which register without a team. */
  team_id?: string;
  event_id: string;
  /** Type of the selected category (category.typeId). */
  type_id: string;
  category_id: string;
  vehicle_id: string;
  navigator_id?: string;
  /** "Other information" from the consent step (required for new registrations). */
  emergency_contact_person?: string;
  emergency_contact_number?: string;
  participation_remarks?: string;
  payment?: RegistrationPaymentInput;
};

/** Entry fee details sent with POST /registrations (backend derives the status). */
export type RegistrationPaymentInput = {
  amount: number;
  order_id?: string;
  transaction_id?: string;
  entry_mode?: "individual" | "sponsor";
  currency?: string;
};

/** Stored payment; null on registrations created before payments were recorded. */
export type RegistrationPayment = {
  status: "paid" | "free";
  amount: number;
  currency?: string;
  order_id?: string | null;
  transaction_id?: string | null;
  entry_mode?: "individual" | "sponsor" | null;
  paid_at?: string | null;
};

/** PUT /registrations/:id — team, category, and event stay locked; no payment. */
export type UpdateRegistrationPayload = {
  vehicle_id: string;
  navigator_id?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

/** The created registration (populated). */
export type CreateRegistrationResponse = ApiResponse<DriverRegistration | null>;
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
  /** Driver / co-driver profile fields (GET /registrations/:id only). */
  gender?: string | null;
  age?: string | number | null;
  address?: string | null;
  license_number?: string | null;
  license_expiry?: string | null;
};

export type RegistrationTeam = {
  _id: string;
  team_name: string;
  team_number?: string | null;
  category: string;
  /** Vehicle type key, e.g. "stock". */
  type?: string | null;
  driver_id?: RegistrationPerson | string | null;
  navigator_id?: RegistrationPerson | string | null;
  member_ids?: RegistrationPerson[];
  /** Embedded co-driver profiles. */
  co_drivers?: RegistrationPerson[];
  /** Auto-created single-driver team for solo categories. */
  is_solo?: boolean;
};

export type RegistrationEvent = {
  _id: string;
  name?: string;
  location?: string | null;
  status?: string;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  rally_start_date?: string | null;
  rally_end_date?: string | null;
};

export type RegistrationVehicle = {
  _id: string;
  model?: string;
  engine?: string;
  power?: number | null;
  engineType?: string | null;
  turboCharge?: boolean | null;
  desiredRallyNumber?: string | null;
  frame?: string | null;
  weight?: number | null;
  length?: number | null;
  tank_capacity?: number | null;
  class?: string | null;
  team_id?: string | null;
  typeId?: { _id: string; name?: string; key?: string } | string | null;
  category_id?: { _id: string; title?: string; key?: string } | string | null;
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
  event_id: string | RegistrationEvent;
  team_id: RegistrationTeam | string | null;
  category_id: RegistrationCategory | string | null;
  vehicle_id?: string | RegistrationVehicle | null;
  type_id?: string | { _id: string; name?: string; key?: string } | null;
  navigator_id?: string | RegistrationPerson | null;
  challenge_id?: string | null;
  status: RegistrationStatus | string;
  pipeline_stage?: string | null;
  firing_order?: number | null;
  rally_number?: string | null;
  emergency_contact_person?: string | null;
  emergency_contact_number?: string | null;
  participation_remarks?: string | null;
  payment?: RegistrationPayment | null;
  registered_at?: string;
  updated_at?: string;
  __v?: number;
};

export type GetEventRegistrationsResponse = ApiResponse<DriverRegistration[]>;
export type GetMyRegistrationsResponse = ApiResponse<DriverRegistration[]>;
