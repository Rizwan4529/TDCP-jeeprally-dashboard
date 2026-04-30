import { Outlet } from "react-router-dom"

import SidebarCommon from "@/components/common/SidebarCommon"
import { Typography } from "@/components/common/Typography"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function SidebarLayout() {
  return (
    <div className="h-full w-full overflow-hidden">
      <SidebarProvider>
        <SidebarCommon />
        <main className="w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Typography as="h1" variant="label" className="text-base font-semibold">
                Jeep Rally
              </Typography>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}
