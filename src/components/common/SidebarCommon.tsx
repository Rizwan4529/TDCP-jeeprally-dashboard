import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  BellIcon,
  CalendarDaysIcon,
  CarIcon,
  ChevronRightIcon,
  ChevronsUpIcon,
  ClipboardListIcon,
  LayoutGridIcon,
  LogOutIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Typography } from "@/components/common/Typography";
import { useSessionUser } from "@/hooks/api/use-session-user";
import { useInviteNotifications } from "@/hooks/use-invite-notifications";
import { ROUTES } from "@/utils/constants";
import { removeAuthToken, toPublicFileUrl } from "@/utils/helpers";
import Logo from "@/assets/icons/logo.png";

type SidebarNavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, icon: LayoutGridIcon },
  { label: "Profile", to: ROUTES.PROFILE, icon: UserIcon },
  { label: "Teams", to: ROUTES.TEAMS, icon: UsersIcon },
  { label: "Vehicle", to: ROUTES.VEHICLE, icon: CarIcon },
  { label: "Events", to: ROUTES.EVENTS, icon: CalendarDaysIcon },
  { label: "Notifications", to: ROUTES.NOTIFICATIONS, icon: BellIcon },
];

function initialsFromName(name: string | undefined) {
  if (!name?.trim()) return "JR";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function SidebarCommon() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state, setOpenMobile, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: sessionUser } = useSessionUser();
  const profileImageUrl = toPublicFileUrl(sessionUser?.profile_image);
  const { hasUnseen: hasUnseenInvites } = useInviteNotifications();

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = () => {
    removeAuthToken();
    void queryClient.clear();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const isNavActive = (to: string) => {
    if (to === ROUTES.DASHBOARD) return location.pathname === to;
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const myEntriesActive =
    location.pathname === ROUTES.MY_REGISTRATIONS ||
    location.pathname.startsWith(`${ROUTES.MY_REGISTRATIONS}/`);
  const registerNowActive = location.pathname === ROUTES.REGISTRATION;
  const registrationActive = myEntriesActive || registerNowActive;

  return (
    <Sidebar className="h-full" collapsible="icon">
      <SidebarHeader className="pt-3 pb-1">
        <SidebarGroup>
          <SidebarMenu className="!gap-4">
            <SidebarMenuItem>
              <Link
                to={ROUTES.DASHBOARD}
                onClick={closeMobileSidebar}
                className="flex items-center gap-3 px-2 py-2"
              >
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-12 w-12 object-contain"
                />
                {!isCollapsed ? (
                  <Typography
                    as="span"
                    variant="h6"
                    className="leading-none text-primary"
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
                const Icon = item.icon;
                const active = isNavActive(item.to);
                const showDot =
                  item.to === ROUTES.NOTIFICATIONS && hasUnseenInvites;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="!h-12 !px-4"
                    >
                      <Link to={item.to} onClick={closeMobileSidebar}>
                        <span className="relative inline-flex">
                          <Icon className="size-5" />
                          {showDot ? (
                            <span
                              aria-hidden
                              className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#E5484D] ring-2 ring-sidebar"
                            />
                          ) : null}
                        </span>
                        <span>{item.label}</span>
                        {showDot ? (
                          <span className="sr-only">(new invites)</span>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <Collapsible
                asChild
                defaultOpen={registrationActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={registrationActive}
                      tooltip="Registration"
                      className="!h-12 !px-4"
                    >
                      <ClipboardListIcon className="size-5" />
                      <span>Registration</span>
                      <ChevronRightIcon className="ml-auto size-4 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mx-0 border-0 px-0 py-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={myEntriesActive}
                          size="md"
                          className="h-9 gap-3 rounded-md px-4 text-muted-foreground data-active:bg-transparent data-active:font-medium data-active:text-primary data-active:hover:bg-sidebar-accent data-active:hover:text-primary data-active:focus:bg-transparent data-active:focus:text-primary"
                        >
                          <Link
                            to={ROUTES.MY_REGISTRATIONS}
                            onClick={closeMobileSidebar}
                          >
                            <span
                              aria-hidden
                              className="mt-px h-px w-3 shrink-0 bg-primary"
                            />
                            <span>My entries</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={registerNowActive}
                          size="md"
                          className="h-9 gap-3 rounded-md px-4 text-muted-foreground data-active:bg-transparent data-active:font-medium data-active:text-primary data-active:hover:bg-sidebar-accent data-active:hover:text-primary data-active:focus:bg-transparent data-active:focus:text-primary"
                        >
                          <Link
                            to={ROUTES.REGISTRATION}
                            onClick={closeMobileSidebar}
                          >
                            <span
                              aria-hidden
                              className="mt-px h-px w-3 shrink-0 bg-primary"
                            />
                            <span>Register now</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className={`cursor-pointer !h-14 ${
                    isCollapsed
                      ? "justify-center"
                      : "!border !border-primary/25 !bg-primary/10 !text-primary hover:!bg-primary/15 hover:!text-primary"
                  }`}
                >
                  <Avatar className="size-7">
                    {profileImageUrl ? (
                      <AvatarImage
                        src={profileImageUrl}
                        alt={sessionUser?.name ?? "Profile"}
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                      {initialsFromName(sessionUser?.name)}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed ? (
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm font-medium text-[#1F1838]">
                        {sessionUser?.name ?? "Account"}
                      </span>
                      <span className="block truncate text-xs text-primary/80">
                        {sessionUser?.email ?? "Signed in"}
                      </span>
                    </span>
                  ) : null}
                  {!isCollapsed ? (
                    <ChevronsUpIcon className="ml-auto size-4 text-primary" />
                  ) : null}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem
                    onClick={() => {
                      closeMobileSidebar();
                      navigate(ROUTES.PROFILE);
                    }}
                  >
                    <UserIcon className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      closeMobileSidebar();
                      handleLogout();
                    }}
                  >
                    <LogOutIcon className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
