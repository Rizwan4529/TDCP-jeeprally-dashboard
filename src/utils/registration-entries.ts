import type {
  DriverRegistration,
  RegistrationCategory,
  RegistrationPerson,
  RegistrationTeam,
} from "@/api/types/registrations";
import type { RallyEvent } from "@/api/types/rally";
import type { Team } from "@/api/types/teams";
import { getRegistrationWindow } from "@/utils/rally-event";
import { CATEGORY_LABELS, type Category } from "@/utils/constants";
import { toDateOnlyInputValue } from "@/utils/helpers";

export function getRegistrationTeam(
  registration: DriverRegistration,
): RegistrationTeam | null {
  const team = registration.team_id;
  if (team && typeof team === "object" && "_id" in team) return team;
  return null;
}

/** Prefer populated `team_id`; otherwise match `/teams/my-teams` by id. */
export function resolveRegistrationTeam(
  registration: DriverRegistration,
  teams: Team[],
): RegistrationTeam | null {
  const populated = getRegistrationTeam(registration);
  if (populated) return populated;

  const teamId = getRegistrationTeamId(registration);
  if (!teamId) return null;

  const team = teams.find((t) => t._id === teamId);
  if (!team) return null;

  return {
    _id: team._id,
    team_name: team.team_name,
    team_number: team.team_number,
    category: team.category,
    driver_id: team.driver_id
      ? toRegistrationPerson(team.driver_id)
      : null,
    navigator_id: team.navigator_id
      ? toRegistrationPerson(team.navigator_id)
      : null,
    member_ids: team.member_ids.map(toRegistrationPerson),
  };
}

function toRegistrationPerson(person: {
  _id: string;
  name: string;
  email?: string | null;
  contact_number?: string | null;
  cnic?: string | null;
  date_of_birth?: string | null;
  occupation?: string | null;
  location?: string | null;
  profile_image?: string | null;
}): RegistrationPerson {
  return {
    _id: person._id,
    name: person.name,
    email: person.email ?? undefined,
    contact_number: person.contact_number ?? undefined,
    cnic: person.cnic ?? undefined,
    date_of_birth: person.date_of_birth ?? undefined,
    occupation: person.occupation ?? undefined,
    location: person.location ?? undefined,
    profile_image: person.profile_image ?? null,
  };
}

/** Prefer team navigator; fall back to registration `navigator_id` on the roster. */
export function resolveRegistrationNavigator(
  registration: DriverRegistration,
  team: RegistrationTeam | null,
): RegistrationPerson | null {
  if (team?.navigator_id && typeof team.navigator_id === "object") {
    return team.navigator_id;
  }

  const nav = registration.navigator_id;
  if (nav && typeof nav === "object" && "_id" in nav) return nav;

  const navId = typeof nav === "string" ? nav : "";
  if (!navId || !team) return null;

  const fromMembers = team.member_ids?.find((m) => m._id === navId);
  if (fromMembers) return fromMembers;

  if (
    team.navigator_id &&
    typeof team.navigator_id === "object" &&
    team.navigator_id._id === navId
  ) {
    return team.navigator_id;
  }

  return null;
}

export function getRegistrationVehicleId(
  registration: DriverRegistration,
): string {
  const vehicle = registration.vehicle_id;
  if (!vehicle) return "";
  if (typeof vehicle === "string") return vehicle;
  if (typeof vehicle === "object" && "_id" in vehicle) return vehicle._id;
  return "";
}

export function getRegistrationTeamId(
  registration: DriverRegistration,
): string {
  const team = registration.team_id;
  if (!team) return "";
  if (typeof team === "string") return team;
  if (typeof team === "object" && "_id" in team) return team._id;
  return "";
}

export function getRegistrationEventId(
  registration: DriverRegistration,
): string {
  const event = registration.event_id;
  if (!event) return "";
  if (typeof event === "string") return event;
  if (typeof event === "object" && "_id" in event) return event._id;
  return "";
}

export function getRegistrationCategory(
  registration: DriverRegistration,
): RegistrationCategory | null {
  const cat = registration.category_id;
  if (cat && typeof cat === "object" && "_id" in cat) return cat;
  return null;
}

export function getRegistrationCategoryId(
  registration: DriverRegistration,
): string {
  const cat = registration.category_id;
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  if (typeof cat === "object" && "_id" in cat) return cat._id;
  return "";
}

export function getRegistrationCategoryKey(
  registration: DriverRegistration,
): string {
  const cat = getRegistrationCategory(registration);
  return cat?.key?.trim() ?? "";
}

/** Pending / approved count as an active entry that blocks re-registering. */
export function isActiveRegistrationStatus(
  status: string | undefined,
): boolean {
  const normalized = (status ?? "").toLowerCase();
  return normalized === "pending" || normalized === "approved";
}

/**
 * True when the driver already has an active registration for the same
 * event + category (matched by category key and/or category id).
 */
export function hasActiveRegistrationForCategory(args: {
  registrations: DriverRegistration[];
  eventId: string | null | undefined;
  categoryKey?: string | null;
  categoryId?: string | null;
}): boolean {
  const eventId = args.eventId?.trim() ?? "";
  const categoryKey = args.categoryKey?.trim() ?? "";
  const categoryId = args.categoryId?.trim() ?? "";
  if (!eventId || (!categoryKey && !categoryId)) return false;

  return args.registrations.some((registration) => {
    if (!isActiveRegistrationStatus(registration.status)) return false;
    if (getRegistrationEventId(registration) !== eventId) return false;

    if (categoryKey) {
      const key = getRegistrationCategoryKey(registration);
      if (key && key === categoryKey) return true;
    }
    if (categoryId) {
      const id = getRegistrationCategoryId(registration);
      if (id && id === categoryId) return true;
    }
    return false;
  });
}

export function getRegistrationCategoryLabel(
  registration: DriverRegistration,
): string {
  const cat = getRegistrationCategory(registration);
  if (cat?.title) return cat.title;
  if (cat?.key) {
    return CATEGORY_LABELS[cat.key as Category] ?? cat.key;
  }
  const team = getRegistrationTeam(registration);
  if (team?.category) {
    return CATEGORY_LABELS[team.category as Category] ?? team.category;
  }
  return "—";
}

export function getPersonName(
  person: RegistrationPerson | string | null | undefined,
): string {
  if (!person) return "—";
  if (typeof person === "string") return person;
  return person.name?.trim() || "—";
}

export function formatRegistrationStatus(status: string | undefined): string {
  if (!status?.trim()) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function formatRegisteredAt(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMemberDob(iso: string | undefined): string {
  if (!iso) return "—";
  return toDateOnlyInputValue(iso) || iso;
}

/**
 * Drivers may update while the rally registration window is open.
 * Pending and approved entries are both allowed; only the registration
 * end-date / window gate blocks updates.
 */
export function canUpdateRegistration(
  registration: DriverRegistration,
  activeRally: RallyEvent | null | undefined,
): { ok: true } | { ok: false; reason: string } {
  // Allow updates for pending and approved (and any other status).
  // Re-enable this if only pending entries should be editable:
  // const status = (registration.status ?? "").toLowerCase();
  // if (status !== "pending") {
  //   return {
  //     ok: false,
  //     reason: `Only pending entries can be updated. This entry is ${formatRegistrationStatus(String(registration.status))}.`,
  //   };
  // }
  void registration.status;

  const window = getRegistrationWindow(activeRally);
  if (!window.isOpen) {
    if (window.status === "not_started") {
      return {
        ok: false,
        reason: "Registration has not opened for this rally yet.",
      };
    }
    if (window.status === "closed") {
      return {
        ok: false,
        reason: "Registration is closed for this rally, so this entry can no longer be updated.",
      };
    }
    return {
      ok: false,
      reason: "Registration dates are unavailable, so this entry cannot be updated right now.",
    };
  }

  return { ok: true };
}

export function registrationStatusTone(status: string | undefined): string {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "bg-[#FFF8E8] text-[#9A6B00] border-[#F0DFA8]";
    case "approved":
      return "bg-[#EAF6EF] text-[#1F6B43] border-[#C8E6D4]";
    case "rejected":
      return "bg-[#FFF5F5] text-[#B91C1C] border-[#F2D6D6]";
    case "withdrawn":
      return "bg-[#F4F5F8] text-[#6B7890] border-[#E8E8E8]";
    default:
      return "bg-[#F4F5F8] text-[#6B7890] border-[#E8E8E8]";
  }
}
