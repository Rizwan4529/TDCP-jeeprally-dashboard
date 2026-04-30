import { BellIcon, InfoIcon, MoonIcon, SearchIcon } from "lucide-react"

import { Typography } from "@/components/common/Typography"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type HeaderCommonProps = {
  title: string
}

export default function HeaderCommon({ title }: HeaderCommonProps) {
  return (
    <header className="flex min-h-24 items-center justify-between gap-4 px-8 py-5">
      <Typography
        as="h1"
        variant="h3"
        className="text-[36px] leading-none font-semibold text-[#1F1838]"
      >
        {title}
      </Typography>

      <div className="flex h-[60px] items-center gap-5 rounded-2xl bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <label className="flex h-10 w-[220px] items-center gap-3 rounded-lg bg-[#F3F5FC] px-4 text-[#2C3F8F]">
          <SearchIcon className="size-4" />
          <input
            type="search"
            placeholder="Search"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#2A3554] outline-none placeholder:text-[#8A95B5]"
          />
        </label>
        <BellIcon className="size-5 text-[#9AA6C8]" />
        <MoonIcon className="size-5 fill-[#9AA6C8] text-[#9AA6C8]" />
        <InfoIcon className="size-5 text-[#9AA6C8]" />
        <Avatar className="size-11 border-2 border-[#253C92]">
          <AvatarFallback className="bg-[#CED8FF] text-sm font-semibold text-[#253C92]">
            JR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
