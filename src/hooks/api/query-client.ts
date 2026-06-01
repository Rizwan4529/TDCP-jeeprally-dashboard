import { QueryCache, QueryClient } from "@tanstack/react-query"

import {
  isUnauthorizedError,
  logoutAndRedirectToLogin,
} from "@/utils/auth-session"

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        logoutAndRedirectToLogin()
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
