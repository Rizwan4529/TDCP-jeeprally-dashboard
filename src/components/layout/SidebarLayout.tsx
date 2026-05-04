import { Outlet, useLocation } from "react-router-dom"

import HeaderCommon from "@/components/common/HeaderCommon"
import SidebarCommon from "@/components/common/SidebarCommon"
import { SidebarProvider } from "@/components/ui/sidebar"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Hello Harsh 👋",
  "/profile": "Profile",
  "/vehicle": "Vehicle",
  "/events": "Events",
  "/registration": "Registrations",
}

const PAGE_SUBTITLES: Record<string, string> = {
  "/dashboard": "Let’s learn something new today!",
}

export default function SidebarLayout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? "Jeep Rally"
  const subtitle = PAGE_SUBTITLES[location.pathname]

  return (
    <div className="h-svh w-full overflow-hidden">
      <SidebarProvider className="h-full min-h-0 overflow-hidden">
        <SidebarCommon />
        <main className="h-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#FDFDFE]">
          <HeaderCommon title={title} subtitle={subtitle} />
          <div className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}
