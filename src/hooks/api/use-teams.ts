import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import {
  createTeam,
  deleteTeam,
  getMyTeams,
  updateTeam,
} from "@/api/services/teams";
import type {
  CreateTeamPayload,
  DeleteTeamResponse,
  GetMyTeamsResponse,
  UpdateTeamPayload,
  UpsertTeamResponse,
} from "@/api/types/teams";

export function useMyTeamsQuery(enabled: boolean) {
  return useQuery<GetMyTeamsResponse, Error>({
    queryKey: queryKeys.teams.myTeams(),
    queryFn: getMyTeams,
    enabled,
    staleTime: 30_000,
  });
}

/** @deprecated Use useMyTeamsQuery */
export const useMyTeamQuery = useMyTeamsQuery;

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation<UpsertTeamResponse, Error, CreateTeamPayload>({
    mutationFn: createTeam,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function useUpdateTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UpsertTeamResponse,
    Error,
    { id: string; payload: UpdateTeamPayload }
  >({
    mutationFn: ({ id, payload }) => updateTeam(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function useDeleteTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteTeamResponse, Error, string>({
    mutationFn: deleteTeam,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}
