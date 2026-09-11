import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { prefetchActiveRally } from "@/hooks/api/use-active-rally";
import { prefetchRallyPricing } from "@/hooks/api/use-rally-pricing";
import { fetchActiveEventId } from "@/utils/rally-event";

/** Fetches GET /rally/active once on app load and caches event id + pricing. */
export function ActiveRallyBootstrap() {
  const queryClient = useQueryClient();

  useEffect(() => {
    void (async () => {
      await prefetchActiveRally(queryClient);
      const eventId = fetchActiveEventId();
      if (eventId) {
        await prefetchRallyPricing(queryClient, eventId);
      }
    })();
  }, [queryClient]);

  return null;
}
