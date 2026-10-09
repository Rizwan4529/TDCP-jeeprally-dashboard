import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import {
  acceptInvite,
  declineInvite,
  getMyInvites,
} from "@/api/services/team-invites";
import type {
  GetMyInvitesResponse,
  RespondToInviteResponse,
} from "@/api/types/team-invites";

/** How often the invite list is re-polled while the tab is visible. */
export const INVITES_POLL_INTERVAL_MS = 5 * 60_000;

export function useMyInvitesQuery(enabled: boolean) {
  return useQuery<GetMyInvitesResponse, Error>({
    queryKey: queryKeys.teamInvites.mine(),
    queryFn: getMyInvites,
    enabled,
    staleTime: 30_000,
    refetchInterval: INVITES_POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}

function useRespondToInviteMutation(
  respond: (inviteId: string) => Promise<RespondToInviteResponse>,
) {
  const queryClient = useQueryClient();

  return useMutation<RespondToInviteResponse, Error, string>({
    mutationFn: respond,
    onSettled: () => {
      // Refresh on failure too, so an invite already handled elsewhere drops out.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.teamInvites.all,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function useAcceptInviteMutation() {
  return useRespondToInviteMutation(acceptInvite);
}

export function useDeclineInviteMutation() {
  return useRespondToInviteMutation(declineInvite);
}
