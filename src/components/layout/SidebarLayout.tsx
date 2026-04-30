import { Outlet, useLocation } from "react-router-dom"

import HeaderCommon from "@/components/common/HeaderCommon"
import SidebarCommon from "@/components/common/SidebarCommon"
import { SidebarProvider } from "@/components/ui/sidebar"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/vehicle": "Vehicle",
  "/events": "Events",
  "/registration": "Registrations",
}

export default function SidebarLayout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? "Jeep Rally"

  return (
    <div className="h-svh w-full overflow-hidden">
      <SidebarProvider className="h-full min-h-0 overflow-hidden">
        <SidebarCommon />
        <main className="h-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#FDFDFE]">
          <HeaderCommon title={title} />
          <div className="px-8 pb-8">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}
