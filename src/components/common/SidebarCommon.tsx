import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  CalendarDaysIcon,
  CarIcon,
  ClipboardListIcon,
  LayoutGridIcon,
  UserIcon,
} from "lucide-react"

import { Typography } from "@/components/common/Typography"
import Logo from "@/assets/icons/logo.png"

type SidebarNavItem = {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutGridIcon },
  { label: "Profile", to: "/profile", icon: UserIcon },
  { label: "Vehicle", to: "/vehicle", icon: CarIcon },
  { label: "Events", to: "/events", icon: CalendarDaysIcon },
  { label: "Registration", to: "/registration", icon: ClipboardListIcon },
]

export default function SidebarCommon() {
  const location = useLocation()
  const { state } = useSidebar()

  return (
    <Sidebar className="h-full" collapsible="icon">
      <SidebarHeader>
        <SidebarGroup>
          <SidebarMenu className="!gap-4">
            <SidebarMenuItem>
              <Link to="/dashboard" className="flex items-center gap-3 px-2 py-2">
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-12 w-12 object-contain"
                />
                {state !== "collapsed" ? (
                  <Typography
                    as="span"
                    variant="h6"
                    className="leading-none text-[#00571C]"
                  >
                    Jeep Rally
                  </Typography>
                ) : null}
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="!gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.to
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                    >
                      <Link to={item.to}>
                        <span>
                          <Icon />
                        </span>
                        <Typography as="span" variant="label" color="inherit">
                          {item.label}
                        </Typography>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
