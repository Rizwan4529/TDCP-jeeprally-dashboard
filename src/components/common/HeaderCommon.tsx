import { BellIcon, InfoIcon, MoonIcon, SearchIcon } from "lucide-react"

import { Typography } from "@/components/common/Typography"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type HeaderCommonProps = {
  title: string
}

export default function HeaderCommon({ title }: HeaderCommonProps) {
  return (
    <header className="flex min-h-24 flex-col items-start justify-between gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center lg:px-8">
      <Typography
        as="h1"
        variant="h3"
        className="text-[28px] leading-none font-semibold text-[#1F1838] sm:text-[32px] lg:text-[36px]"
      >
        {title}
      </Typography>

      <div className="flex h-[56px] w-full max-w-full items-center gap-3 rounded-2xl bg-white px-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:h-[60px] sm:gap-5 sm:px-4 md:w-auto">
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
        <Avatar className="size-10 shrink-0 border-2 border-[#253C92] sm:size-11">
          <AvatarFallback className="bg-[#CED8FF] text-sm font-semibold text-[#253C92]">
            JR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
