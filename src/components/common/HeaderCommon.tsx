import { useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, SettingsIcon, UserRoundIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Typography } from "@/components/common/Typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSessionUser } from "@/hooks/api/use-session-user";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants";
import { removeAuthToken, toPublicFileUrl } from "@/utils/helpers";

type HeaderCommonProps = {
  title: string;
  subtitle?: string;
};

function initialsFromName(name: string | undefined) {
  if (!name?.trim()) {
    return "JR";
  }
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function MenuItemIcon({
  icon: Icon,
  className,
}: {
  icon: typeof UserRoundIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={2} aria-hidden />
    </span>
  );
}

function HeaderUserAvatar({
  name,
  profileImage,
  className,
}: {
  name: string | undefined;
  profileImage: string | null;
  className?: string;
}) {
  const initials = initialsFromName(name);

  return (
    <Avatar className={cn("border-2 border-[#253C92]", className)}>
      {profileImage ? (
        <AvatarImage src={profileImage} alt={name ?? "Profile photo"} />
      ) : null}
      <AvatarFallback className="bg-[#CED8FF] text-sm font-semibold text-[#253C92]">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default function HeaderCommon({ title, subtitle }: HeaderCommonProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: sessionUser } = useSessionUser();
  const profileImageUrl = toPublicFileUrl(sessionUser?.profile_image);

  const handleLogout = () => {
    removeAuthToken();
    void queryClient.clear();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="flex min-h-24 flex-col items-start justify-between gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center lg:px-8">
      <div className="space-y-3">
        <Typography
          as="h1"
          variant="h3"
          className="text-[28px] leading-none font-semibold text-[#1F1838] sm:text-[32px] lg:text-[36px]"
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body-lg"
            className="leading-none text-[#8A8793] sm:text-[20px]"
          >
            {subtitle}
          </Typography>
        ) : null}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open account menu"
            className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#253C92]/30"
          >
            <HeaderUserAvatar
              name={sessionUser?.name}
              profileImage={profileImageUrl}
              className="size-10 sm:size-11"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 rounded-lg bg-[#F7F9FC] px-3 py-3">
              <HeaderUserAvatar
                name={sessionUser?.name}
                profileImage={profileImageUrl}
                className="size-11"
              />
              <div className="min-w-0 flex-1">
                <Typography
                  as="p"
                  variant="label"
                  className="truncate text-[14px] font-semibold text-[#1F1838]"
                >
                  {sessionUser?.name ?? "Account"}
                </Typography>
                <Typography
                  as="p"
                  variant="caption"
                  className="truncate text-[12px] text-[#6B7890]"
                >
                  {sessionUser?.email ?? "Signed in"}
                </Typography>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            className="cursor-pointer gap-3 rounded-lg px-2 py-2.5"
            onSelect={() => navigate(ROUTES.PROFILE)}
          >
            <MenuItemIcon
              icon={UserRoundIcon}
              className="bg-[#EAF6EF] text-[#2F8F57]"
            />
            <Typography as="span" variant="label" color="inherit">
              View Profile
            </Typography>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-3 rounded-lg px-2 py-2.5">
            <MenuItemIcon
              icon={SettingsIcon}
              className="bg-[#EEF2F7] text-[#64748B]"
            />
            <Typography as="span" variant="label" color="inherit">
              Settings
            </Typography>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-3 rounded-lg px-2 py-2.5"
            onSelect={handleLogout}
          >
            <MenuItemIcon
              icon={LogOutIcon}
              className="bg-[#FEE2E2] text-[#B91C1C]"
            />
            <Typography as="span" variant="label" color="inherit">
              Logout
            </Typography>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <div className="flex h-[56px] w-full max-w-full items-center gap-3 rounded-2xl bg-white px-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:h-[60px] sm:gap-5 sm:px-4 md:w-auto">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-lg bg-[#F3F5FC] px-3 text-[#2C3F8F] sm:w-[220px] sm:flex-none sm:px-4">
          <SearchIcon className="size-4" />
          <input
            type="search"
            placeholder="Search"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#2A3554] outline-none placeholder:text-[#8A95B5]"
          />
        </label>
        <BellIcon className="size-5 shrink-0 text-[#9AA6C8]" />
        <MoonIcon className="size-5 shrink-0 fill-[#9AA6C8] text-[#9AA6C8]" />
        <InfoIcon className="size-5 shrink-0 text-[#9AA6C8]" />
       
      </div> */}
    </header>
  );
}
