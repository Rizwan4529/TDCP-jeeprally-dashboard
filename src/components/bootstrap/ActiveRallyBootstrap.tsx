import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { prefetchActiveRally } from "@/hooks/api/use-active-rally";

/** Fetches GET /rally/active once on app load and caches event id in localStorage. */
export function ActiveRallyBootstrap() {
  const queryClient = useQueryClient();

  useEffect(() => {
    void prefetchActiveRally(queryClient);
  }, [queryClient]);

  return null;
}
