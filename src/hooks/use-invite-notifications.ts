import { useCallback, useMemo, useSyncExternalStore } from "react";

import { useMyInvitesQuery } from "@/hooks/api/use-team-invites";
import { useSessionUser } from "@/hooks/api/use-session-user";
import { fetchAuthToken } from "@/utils/helpers";
import {
  getSeenInviteIds,
  isPendingInvite,
  markInvitesSeen,
  subscribeSeenInvites,
} from "@/utils/invite-notifications";

/** Shared invite list + "unseen" state for the sidebar dot, watcher and page. */
export function useInviteNotifications() {
  const { data: sessionUser } = useSessionUser();
  const userId = sessionUser?._id;
  const invitesQuery = useMyInvitesQuery(Boolean(fetchAuthToken()));

  const seenIds = useSyncExternalStore(subscribeSeenInvites, () =>
    getSeenInviteIds(userId),
  );

  const invites = useMemo(
    () => invitesQuery.data?.data ?? [],
    [invitesQuery.data],
  );
  const pendingInvites = useMemo(() => invites.filter(isPendingInvite), [invites]);
  const hasUnseen = pendingInvites.some((invite) => !seenIds.has(invite._id));

  const markAllSeen = useCallback(() => {
    markInvitesSeen(
      userId,
      invites.map((invite) => invite._id),
    );
  }, [userId, invites]);

  return { invitesQuery, invites, pendingInvites, hasUnseen, markAllSeen };
}
