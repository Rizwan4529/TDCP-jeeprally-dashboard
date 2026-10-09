import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useInviteNotifications } from "@/hooks/use-invite-notifications";
import { ROUTES } from "@/utils/constants";
import { formatInviteTeam } from "@/utils/invite-notifications";

/**
 * Mounted once in the sidebar layout so invites poll on every signed-in page.
 * Toasts pending invites that were not in the previous fetch; the first fetch
 * only sets the baseline (the sidebar dot covers invites that arrived earlier).
 */
export function InviteNotificationsWatcher() {
  const navigate = useNavigate();
  const { invitesQuery, invites } = useInviteNotifications();
  const knownIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!invitesQuery.isSuccess) return;

    const known = knownIdsRef.current;
    knownIdsRef.current = new Set(invites.map((invite) => invite._id));
    if (!known) return;

    for (const invite of invites) {
      if (invite.status !== "pending" || known.has(invite._id)) continue;
      const sender = invite.driver_id?.name ?? "A driver";
      toast(`${sender} invited you to join ${formatInviteTeam(invite)}`, {
        id: `team-invite-${invite._id}`,
        description: "Accept to join as co-driver.",
        action: {
          label: "View",
          onClick: () => navigate(ROUTES.NOTIFICATIONS),
        },
      });
    }
  }, [invitesQuery.isSuccess, invites, navigate]);

  return null;
}
