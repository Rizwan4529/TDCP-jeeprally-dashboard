import { Navigate, Outlet } from "react-router-dom"

import { ROUTES } from "@/utils/constants"
import { fetchAuthToken } from "@/utils/helpers"

/** Login / signup only; authenticated users are sent to the dashboard. */
export function GuestRoute() {
  if (fetchAuthToken()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
