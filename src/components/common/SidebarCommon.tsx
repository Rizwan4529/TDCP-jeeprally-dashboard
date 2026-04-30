import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"

import { Typography } from "@/components/common/Typography"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const navigate = useNavigate()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleLogout = () => {
    navigate("/login")
  }

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
                {!isCollapsed ? (
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

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-[#E8E8E8] bg-white p-3 text-left shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
            >
              <Avatar className="size-10 border border-[#D9E5DD]">
                <AvatarFallback className="bg-[#EAF6EF] text-sm font-semibold text-[#00571C]">
                  MR
                </AvatarFallback>
              </Avatar>
              {!isCollapsed ? (
                <span className="min-w-0 flex-1">
                  <Typography
                    as="span"
                    variant="label"
                    className="block truncate text-[#1F1838]"
                  >
                    Muhammad Rizwan
                  </Typography>
                  <Typography
                    as="span"
                    variant="caption"
                    className="mt-1 block truncate text-[#6B7890]"
                  >
                    rizwan@gmail.com
                  </Typography>
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={10}
            className="w-56"
          >
            <DropdownMenuLabel>
              <Typography as="span" variant="caption" color="inherit">
                Account
              </Typography>
            </DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer gap-2 py-2">
              <UserIcon className="size-4" />
              <Typography as="span" variant="label" color="inherit">
                View Profile
              </Typography>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2 py-2">
              <SettingsIcon className="size-4" />
              <Typography as="span" variant="label" color="inherit">
                Settings
              </Typography>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2 py-2"
              onSelect={handleLogout}
            >
              <LogOutIcon className="size-4" />
              <Typography as="span" variant="label" color="inherit">
                Logout
              </Typography>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
