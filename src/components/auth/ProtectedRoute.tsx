import { Navigate, Outlet } from "react-router-dom"

import { ROUTES } from "@/utils/constants"
import { fetchAuthToken } from "@/utils/helpers"

/** Allows the subtree only when an auth token is present (validated by APIs; 401 clears it). */
export function ProtectedRoute() {
  if (!fetchAuthToken()) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}
