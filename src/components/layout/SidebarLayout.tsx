import { Outlet } from "react-router-dom";

import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import SidebarCommon from "@/components/common/SidebarCommon";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function SidebarLayout() {
  return (
    <div className="h-svh max-h-svh w-full overflow-hidden">
      <SidebarProvider className="!min-h-0 flex h-svh max-h-svh w-full overflow-hidden">
        <SidebarCommon />
        <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#FDFDFE]">
          <div className="flex shrink-0 items-center gap-2 px-4 pt-3 pb-2 md:px-7 md:pt-4 md:pb-3">
            <SidebarTrigger />
            <Breadcrumbs />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
