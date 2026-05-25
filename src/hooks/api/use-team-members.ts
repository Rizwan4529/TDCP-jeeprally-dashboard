import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { queryKeys } from "@/api/query-keys";
import {
  createTeamMember,
  deleteTeamMember,
  getTeamMembers,
  updateTeamMember,
} from "@/api/services/team-members";
import type {
  CreateTeamMemberPayload,
  DeleteTeamMemberResponse,
  GetTeamMembersResponse,
  UpdateTeamMemberPayload,
  UpsertTeamMemberResponse,
} from "@/api/types/team-members";

export function useTeamMembersQuery(enabled = true) {
  return useQuery<GetTeamMembersResponse, Error>({
    queryKey: queryKeys.teamMembers.list(),
    queryFn: getTeamMembers,
    enabled,
    staleTime: 30_000,
  });
}

export function useCreateTeamMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation<UpsertTeamMemberResponse, Error, CreateTeamMemberPayload>({
    mutationFn: createTeamMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
    },
  });
}

export function useUpdateTeamMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    UpsertTeamMemberResponse,
    Error,
    { id: string; payload: UpdateTeamMemberPayload }
  >({
    mutationFn: ({ id, payload }) => updateTeamMember(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function useDeleteTeamMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation<DeleteTeamMemberResponse, Error, string>({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function getTeamMemberErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data;
    if (msg && typeof msg === "object" && "message" in msg) {
      return String((msg as { message: string }).message);
    }
  }
  return err instanceof Error ? err.message : "Request failed.";
}
