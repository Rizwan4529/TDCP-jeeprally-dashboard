import { Navigate, Route, Routes } from "react-router-dom"

import { GuestRoute } from "@/components/auth/GuestRoute"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import SidebarLayout from "@/components/layout/SidebarLayout"
import DashboardPage from "@/pages/Dashboard"
import EventsPage from "@/pages/Events"
import LoginPage from "@/pages/Login"
import NotFoundPage from "@/pages/NotFound"
import ProfilePage from "@/pages/Profile"
import RegistrationPage from "@/pages/Registration"
import TeamsPage from "@/pages/Teams"
import SignupPage from "@/pages/Signup"
import VehiclePage from "@/pages/Vehicle"
import { ROUTES } from "@/utils/constants"

const App = () => {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<SidebarLayout />}>
          <Route
            index
            element={<Navigate to={ROUTES.DASHBOARD} replace />}
          />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path={ROUTES.TEAMS.replace(/^\//, "")} element={<TeamsPage />} />
          <Route path="vehicle" element={<VehiclePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="registration" element={<RegistrationPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
