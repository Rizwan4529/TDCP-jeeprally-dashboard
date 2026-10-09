export const ENUMS = {
  AUTH_TOKEN: "token",
  /** Serialized `LoginUser` JSON from the last login (or profile update). */
  AUTH_USER: "auth_user",
  /** Mongo `_id` of the current active rally from GET /rally/active. */
  ACTIVE_EVENT_ID: "active_event_id",
} as const;

/** App paths — use these instead of hard-coded route strings where practical. */
export const ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  TEAMS: "/teams",
  TEAMS_NEW: "/teams/new",
  TEAMS_EDIT: "/teams/:id/edit",
  VEHICLE: "/vehicle",
  VEHICLE_NEW: "/vehicle/new",
  VEHICLE_EDIT: "/vehicle/:id/edit",
  EVENTS: "/events",
  /** Team invites sent to the signed-in competitor. */
  NOTIFICATIONS: "/notifications",
  /** Driver's registration entries for the active rally. */
  MY_REGISTRATIONS: "/registrations",
  /** New registration wizard. */
  REGISTRATION: "/registration",
  PAYMENT_CALLBACK: "/payment-callback",
} as const;

export function vehicleEditPath(id: string) {
  return `/vehicle/${id}/edit`;
}

/** Relative API paths that may return 401 without treating the user as logged-out. */
export const AUTH_PUBLIC_API_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

export const CATEGORY = {
  STOCK_PREPAID: "stock_prepaid",
  QUAD_BIKE: "quad_bike",
  DIRT_BIKE: "dirt_bike",
  JEEP: "jeep",
  TRUCK_RACE: "truck_race",
} as const;

export type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

export const CATEGORIES = [
  CATEGORY.STOCK_PREPAID,
  CATEGORY.QUAD_BIKE,
  CATEGORY.DIRT_BIKE,
  CATEGORY.JEEP,
  CATEGORY.TRUCK_RACE,
] as const satisfies readonly Category[];

export const CATEGORY_LABELS: Record<Category, string> = {
  [CATEGORY.STOCK_PREPAID]: "Stock & Prepaid",
  [CATEGORY.QUAD_BIKE]: "Quad Bike",
  [CATEGORY.DIRT_BIKE]: "Dirt Bike",
  [CATEGORY.JEEP]: "Jeep",
  [CATEGORY.TRUCK_RACE]: "Truck Race",
};

export const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
] as const;
