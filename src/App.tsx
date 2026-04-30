import { Navigate, Route, Routes } from "react-router-dom"

import SidebarLayout from "@/components/layout/SidebarLayout"
import DashboardPage from "@/pages/Dashboard"
import EventsPage from "@/pages/Events"
import NotFoundPage from "@/pages/NotFound"
import ProfilePage from "@/pages/Profile"
import RegistrationPage from "@/pages/Registration"
import VehiclePage from "@/pages/Vehicle"

const App = () => {
  return (
    <Routes>
      <Route element={<SidebarLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/vehicle" element={<VehiclePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App;
