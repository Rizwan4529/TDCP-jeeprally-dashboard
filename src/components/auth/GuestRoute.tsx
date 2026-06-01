import { Navigate, Outlet } from "react-router-dom"

import { isAuthenticated } from "@/utils/auth-session"
import { ROUTES } from "@/utils/constants"

/** Login / signup only; authenticated users are sent to the dashboard. */
export function GuestRoute() {
  if (isAuthenticated()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
