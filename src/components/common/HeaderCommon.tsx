import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Typography } from "@/components/common/Typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSessionUser } from "@/hooks/api/use-session-user";
import { ROUTES } from "@/utils/constants";
import { removeAuthToken } from "@/utils/helpers";

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

export default function HeaderCommon({ title, subtitle }: HeaderCommonProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: sessionUser } = useSessionUser();
  const avatarInitials = initialsFromName(sessionUser?.name);

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
          <button type="button" className="shrink-0 rounded-full outline-none">
            <Avatar className="size-10 border-2 border-[#253C92] sm:size-11">
              <AvatarFallback className="bg-[#CED8FF] text-sm font-semibold text-[#253C92]">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <Typography as="span" variant="caption" color="inherit">
              Account
            </Typography>
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer gap-2 py-2"
            onSelect={() => navigate("/profile")}
          >
            <Typography as="span" variant="label" color="inherit">
              View Profile
            </Typography>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2 py-2">
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
