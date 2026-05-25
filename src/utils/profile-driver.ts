import type { LoginUser } from "@/api/types/auth";
import type { Team } from "@/api/types/teams";

/** Unified driver row for Profile (team embed + login session). */
export type ProfileDriver = {
  _id: string;
  name: string;
  email: string;
  contact_number: string;
  gender?: string | null;
  age?: string | number | null;
  address?: string | null;
  location?: string | null;
  occupation?: string | null;
  cnic?: string | null;
  date_of_birth?: string | null;
  license_number?: string | null;
  license_expiry?: string | null;
  profile_image?: string | null;
  cnic_image?: string | null;
  license_image?: string | null;
};

export function sessionToProfileDriver(session: LoginUser): ProfileDriver {
  return sessionToProfile(session);
}

function sessionToProfile(session: LoginUser): ProfileDriver {
  return {
    _id: session._id,
    name: session.name,
    email: session.email,
    contact_number: session.contact_number,
    gender: session.gender,
    age: session.age,
    address: session.address,
    location: null,
    occupation: session.occupation,
    cnic: session.cnic,
    date_of_birth: session.date_of_birth,
    license_number: session.license_number,
    license_expiry: session.license_expiry,
    profile_image: session.profile_image,
    cnic_image: session.cnic_image,
    license_image: session.license_image,
  };
}

function embedToProfile(embed: NonNullable<Team["driver_id"]>): ProfileDriver {
  return {
    _id: embed._id,
    name: embed.name,
    email: embed.email,
    contact_number: embed.contact_number,
    gender: embed.gender ?? null,
    age: embed.age ?? null,
    address: embed.address ?? embed.location ?? null,
    location: embed.location ?? null,
    occupation: embed.occupation ?? null,
    cnic: embed.cnic ?? null,
    date_of_birth: embed.date_of_birth ?? null,
    license_number: embed.license_number ?? null,
    license_expiry: embed.license_expiry ?? null,
    profile_image: embed.profile_image ?? null,
    cnic_image: embed.cnic_image ?? null,
    license_image: embed.license_image ?? null,
  };
}

/**
 * Prefer the logged-in user's payload when it matches the team's driver id
 * so Profile shows the same fields as login (`gender`, `license_*`, images, etc.).
 */
export function mergeTeamDriverWithSession(
  embed: Team["driver_id"] | null | undefined,
  session: LoginUser | null,
): ProfileDriver | null {
  if (!embed && !session) {
    return null;
  }
  if (!session) {
    return embed ? embedToProfile(embed) : null;
  }
  if (!embed) {
    return sessionToProfile(session);
  }
  if (session._id !== embed._id) {
    return embedToProfile(embed);
  }
  return {
    _id: session._id,
    name: session.name,
    email: session.email,
    contact_number: session.contact_number,
    gender: session.gender ?? embed.gender ?? null,
    age: session.age ?? embed.age ?? null,
    address: session.address ?? embed.address ?? embed.location ?? null,
    location: embed.location ?? null,
    occupation: session.occupation ?? embed.occupation ?? null,
    cnic: session.cnic ?? embed.cnic ?? null,
    date_of_birth: session.date_of_birth ?? embed.date_of_birth ?? null,
    license_number: session.license_number ?? embed.license_number ?? null,
    license_expiry: session.license_expiry ?? embed.license_expiry ?? null,
    profile_image: session.profile_image ?? embed.profile_image ?? null,
    cnic_image: session.cnic_image ?? embed.cnic_image ?? null,
    license_image: session.license_image ?? embed.license_image ?? null,
  };
}

/** Best-effort parse of `user` from generic auth API envelopes. */
export function parseLoginUserFromApiEnvelope(data: unknown): LoginUser | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const root = data as Record<string, unknown>;
  if (
    typeof root.user === "object" &&
    root.user !== null &&
    "_id" in root.user
  ) {
    return root.user as LoginUser;
  }
  const inner = root.data;
  if (inner && typeof inner === "object") {
    const d = inner as Record<string, unknown>;
    if (typeof d.user === "object" && d.user !== null && "_id" in d.user) {
      return d.user as LoginUser;
    }
    if (typeof d._id === "string" && typeof d.email === "string") {
      return d as LoginUser;
    }
  }
  return null;
}
