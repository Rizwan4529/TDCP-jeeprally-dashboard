import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { registerUser } from "@/api/services/auth";
import type { RegisterPayload, RegisterResponse } from "@/api/types/auth";

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: registerUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
