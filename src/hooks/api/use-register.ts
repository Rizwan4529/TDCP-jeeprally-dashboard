import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-keys"
import { registerUser } from "@/lib/api/services/auth"
import type { RegisterRequest, RegisterResponse } from "@/lib/api/types/auth"

export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: registerUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
    },
  })
}
