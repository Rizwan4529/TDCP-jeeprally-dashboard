export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    sessionUser: () => [...queryKeys.auth.all, "session-user"] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
  },
  teamMembers: {
    all: ["team-members"] as const,
    list: () => [...queryKeys.teamMembers.all, "list"] as const,
    detail: (id: string) => [...queryKeys.teamMembers.all, "detail", id] as const,
  },
  teams: {
    all: ["teams"] as const,
    myTeams: () => [...queryKeys.teams.all, "my-teams"] as const,
    /** @deprecated use myTeams */
    myTeam: () => [...queryKeys.teams.all, "my-teams"] as const,
  },
  vehicles: {
    all: ["vehicles"] as const,
    myVehicles: () => [...queryKeys.vehicles.all, "my-vehicles"] as const,
  },
  rally: {
    all: ["rally"] as const,
    events: (params: unknown) => [...queryKeys.rally.all, "events", params] as const,
  },
} as const
