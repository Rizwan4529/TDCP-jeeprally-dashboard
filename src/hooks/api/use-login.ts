import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { loginUser } from "@/api/services/auth";
import type { LoginRequest, LoginResponse } from "@/api/types/auth";
import { updateAuthToken, updateAuthUser } from "@/utils/helpers";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginUser,
    onSuccess: (response) => {
      updateAuthToken(response.data.accessToken);
      updateAuthUser(response.data.user);
      queryClient.setQueryData(
        queryKeys.auth.sessionUser(),
        response.data.user,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
