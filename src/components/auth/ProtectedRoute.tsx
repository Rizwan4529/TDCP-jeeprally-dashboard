import { Navigate, Outlet, useLocation } from "react-router-dom"

import { isAuthenticated } from "@/utils/auth-session"
import { ROUTES } from "@/utils/constants"

/** Allows the subtree only when a auth token exists in localStorage. */
export function ProtectedRoute() {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  return <Outlet />
}
