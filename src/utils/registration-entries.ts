import type {
  DriverRegistration,
  RegistrationCategory,
  RegistrationPerson,
  RegistrationStatus,
  RegistrationTeam,
} from "@/api/types/registrations";
import type { RallyEvent } from "@/api/types/rally";
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

export function getRegistrationCategory(
  registration: DriverRegistration,
): RegistrationCategory | null {
  const cat = registration.category_id;
  if (cat && typeof cat === "object" && "_id" in cat) return cat;
  return null;
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
 * Drivers may update only while status is pending and the active rally
 * registration window is open.
 */
export function canUpdateRegistration(
  registration: DriverRegistration,
  activeRally: RallyEvent | null | undefined,
): { ok: true } | { ok: false; reason: string } {
  const status = (registration.status ?? "").toLowerCase() as RegistrationStatus | string;
  if (status !== "pending") {
    return {
      ok: false,
      reason: `Only pending entries can be updated. This entry is ${formatRegistrationStatus(String(registration.status))}.`,
    };
  }

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
