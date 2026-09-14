import { Navigate, Route, Routes } from "react-router-dom"

import { ActiveRallyBootstrap } from "@/components/bootstrap/ActiveRallyBootstrap"
import { GuestRoute } from "@/components/auth/GuestRoute"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import SidebarLayout from "@/components/layout/SidebarLayout"
import DashboardPage from "@/pages/Dashboard"
import EventsPage from "@/pages/Events"
import LoginPage from "@/pages/Login"
import ForgotPasswordPage from "@/pages/ForgotPassword"
import ResetPasswordPage from "@/pages/ResetPassword"
import NotFoundPage from "@/pages/NotFound"
import PaymentCallbackPage from "@/pages/PaymentCallback"
import ProfilePage from "@/pages/Profile"
import ProfileEditPage from "@/pages/ProfileEditPage"
import RegistrationPage from "@/pages/Registration"
import MyRegistrationsPage from "@/pages/MyRegistrations"
import TeamsPage from "@/pages/Teams"
import SignupPage from "@/pages/Signup"
import VehiclePage from "@/pages/Vehicle"
import VehicleFormPage from "@/pages/VehicleFormPage"
import { ROUTES } from "@/utils/constants"

const App = () => {
  return (
    <>
      <ActiveRallyBootstrap />
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={<ForgotPasswordPage />}
          />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<SidebarLayout />}>
            <Route
              index
              element={<Navigate to={ROUTES.DASHBOARD} replace />}
            />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route
              path={ROUTES.PROFILE_EDIT.replace(/^\//, "")}
              element={<ProfileEditPage />}
            />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path={ROUTES.TEAMS.replace(/^\//, "")}
              element={<TeamsPage />}
            />
            <Route
              path={ROUTES.TEAMS_NEW.replace(/^\//, "")}
              element={
                <Navigate to={ROUTES.TEAMS} replace state={{ tab: "teams" }} />
              }
            />
            <Route
              path={ROUTES.TEAMS_EDIT.replace(/^\//, "")}
              element={
                <Navigate to={ROUTES.TEAMS} replace state={{ tab: "teams" }} />
              }
            />
            <Route
              path={ROUTES.VEHICLE_NEW.replace(/^\//, "")}
              element={<VehicleFormPage />}
            />
            <Route
              path={ROUTES.VEHICLE_EDIT.replace(/^\//, "")}
              element={<VehicleFormPage />}
            />
            <Route
              path={ROUTES.VEHICLE.replace(/^\//, "")}
              element={<VehiclePage />}
            />

            <Route path="events" element={<EventsPage />} />
            <Route
              path={ROUTES.MY_REGISTRATIONS.replace(/^\//, "")}
              element={<MyRegistrationsPage />}
            />
            <Route path="registration" element={<RegistrationPage />} />
            <Route
              path={ROUTES.PAYMENT_CALLBACK.replace(/^\//, "")}
              element={<PaymentCallbackPage />}
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </>
  )
}

export default App
