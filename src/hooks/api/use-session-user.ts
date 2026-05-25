import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import type { LoginUser } from "@/api/types/auth";
import { fetchAuthUser } from "@/utils/helpers";

export function useSessionUser() {
  return useQuery({
    queryKey: queryKeys.auth.sessionUser(),
    queryFn: (): LoginUser | null => fetchAuthUser(),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    initialData: () => fetchAuthUser(),
  });
}
