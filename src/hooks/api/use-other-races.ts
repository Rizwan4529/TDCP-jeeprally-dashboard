import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { queryKeys } from "@/api/query-keys";
import {
  createOtherRace,
  deleteOtherRace,
  getOtherRaces,
  updateOtherRace,
} from "@/api/services/other-races";
import type {
  CreateOtherRacePayload,
  DeleteOtherRaceResponse,
  GetOtherRacesResponse,
  UpdateOtherRacePayload,
  UpsertOtherRaceResponse,
} from "@/api/types/other-races";

export function useOtherRacesQuery(enabled = true) {
  return useQuery<GetOtherRacesResponse, Error>({
    queryKey: queryKeys.otherRaces.list(),
    queryFn: getOtherRaces,
    enabled,
    staleTime: 30_000,
  });
}

export function useCreateOtherRaceMutation() {
  const queryClient = useQueryClient();
  return useMutation<UpsertOtherRaceResponse, Error, CreateOtherRacePayload>({
    mutationFn: createOtherRace,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.otherRaces.all });
    },
  });
}

export function useUpdateOtherRaceMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    UpsertOtherRaceResponse,
    Error,
    { id: string; payload: UpdateOtherRacePayload }
  >({
    mutationFn: ({ id, payload }) => updateOtherRace(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.otherRaces.all });
    },
  });
}

export function useDeleteOtherRaceMutation() {
  const queryClient = useQueryClient();
  return useMutation<DeleteOtherRaceResponse, Error, string>({
    mutationFn: deleteOtherRace,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.otherRaces.all });
    },
  });
}

export function getOtherRaceErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data;
    if (msg && typeof msg === "object" && "message" in msg) {
      return String((msg as { message: string }).message);
    }
  }
  return err instanceof Error ? err.message : "Request failed.";
}
