import { Clock3Icon, MapPinIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const upcomingEvents = [
  {
    id: "thal-rally-jan-04-a",
    day: "04",
    month: "JAN",
    title: "Thal jeep rally",
    time: "08:00AM -10:00PM",
    location: "Cholistan, desert Bhawalpur",
  },
  {
    id: "thal-rally-jan-04-b",
    day: "04",
    month: "JAN",
    title: "Thal jeep rally",
    time: "08:00AM -10:00PM",
    location: "Cholistan, desert Bhawalpur",
  },
] as const

const eventHistory = [
  {
    id: "tdcp-2024-first",
    event: "TDCP Jeep rally 2024",
    position: "1",
    medal: "#EAB308",
    vehicle: "Nissan Juke",
    year: "2024",
    time: "01:21:23",
  },
  {
    id: "tdcp-2023-second",
    event: "TDCP Jeep rally 2024",
    position: "2",
    medal: "#777777",
    vehicle: "Dirt bike",
    year: "2023",
    time: "01:21:23",
  },
  {
    id: "tdcp-2024-third",
    event: "TDCP Jeep rally 2024",
    position: "3",
    medal: "#E17B00",
    vehicle: "Revo",
    year: "2024",
    time: "01:21:23",
  },
  {
    id: "tdcp-2024-fourth",
    event: "TDCP Jeep rally 2024",
    position: "4th",
    vehicle: "hilux",
    year: "2024",
    time: "01:21:23",
  },
] as const

const surfaceCard =
  "rounded-lg border border-[#E0E0E0] bg-white shadow-none ring-0"

export default function EventsPage() {
  return (
    <div className="space-y-9 pb-3 pt-8">
      <UpcomingEvents />
      <PreviousEventHistory />
    </div>
  )
}

function UpcomingEvents() {
  return (
    <Card className={cn(surfaceCard, "gap-0 py-0")}>
      <CardHeader className="px-7 pb-5 pt-8 sm:px-10">
        <CardTitle className="text-[22px] font-bold uppercase leading-none text-[#2D2D31]">
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-7 pb-10 sm:px-10">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex min-h-[70px] items-center gap-5 rounded-lg border border-[#DCDDE2] bg-gradient-to-r from-white to-[#FAFBFF] px-3"
          >
            <div className="flex size-[52px] shrink-0 flex-col items-center justify-center rounded-[4px] bg-dashboard-icon-bg text-[#319F60]">
              <span className="text-[20px] font-bold leading-none">
                {event.day}
              </span>
              <span className="mt-1 text-[10px] font-medium leading-none text-[#61726A]">
                {event.month}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold leading-tight text-[#26262C]">
                {event.title}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-[#7F8697]">
                <span className="inline-flex items-center gap-1">
                  <Clock3Icon className="size-3.5" />
                  {event.time}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="size-3.5 fill-[#7F8697]" />
                  {event.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PreviousEventHistory() {
  return (
    <Card className={cn(surfaceCard, "gap-0 py-0")}>
      <CardHeader className="px-7 pb-7 pt-9 sm:px-10">
        <CardTitle className="text-[22px] font-bold uppercase leading-none text-[#2D2D31]">
          Previous Event History
        </CardTitle>
      </CardHeader>
      <CardContent className="px-7 pb-14 sm:px-10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-[15px] font-semibold text-[#747474]">
                <th className="rounded-l-[4px] border-y border-l border-[#E0E0E0] bg-[#FBFBFC] px-4 py-4 text-center">
                  Event
                </th>
                <th className="border-y border-[#E0E0E0] bg-[#FBFBFC] px-4 py-4 text-center">
                  Position
                </th>
                <th className="border-y border-[#E0E0E0] bg-[#FBFBFC] px-4 py-4 text-center">
                  Vehicle
                </th>
                <th className="border-y border-[#E0E0E0] bg-[#FBFBFC] px-4 py-4 text-center">
                  year
                </th>
                <th className="rounded-r-[4px] border-y border-r border-[#E0E0E0] bg-[#FBFBFC] px-4 py-4 text-center">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {eventHistory.map((row) => (
                <tr key={row.id} className="text-[15px]">
                  <td className="rounded-l-[4px] border-y border-l border-[#E0E0E0] px-4 py-3 text-[#111111]">
                    {row.event}
                  </td>
                  <td className="border-y border-[#E0E0E0] px-4 py-3 text-center text-[#747474]">
                    {"medal" in row ? (
                      <MedalPosition color={row.medal} value={row.position} />
                    ) : (
                      row.position
                    )}
                  </td>
                  <td className="border-y border-[#E0E0E0] px-4 py-3 text-center text-[#747474]">
                    {row.vehicle}
                  </td>
                  <td className="border-y border-[#E0E0E0] px-4 py-3 text-center text-[#747474]">
                    {row.year}
                  </td>
                  <td className="rounded-r-[4px] border-y border-r border-[#E0E0E0] px-4 py-3 text-center text-[#747474]">
                    {row.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function MedalPosition({ color, value }: { color: string; value: string }) {
  return (
    <span
      className="relative mx-auto flex size-6 items-center justify-center text-[11px] font-bold text-white"
      aria-label={`${value} place`}
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M8.2 13.3 5.9 20l4.1-2 2 4 2-4 4.1 2-2.3-6.7A7 7 0 1 0 8.2 13.3Z"
          fill={color}
        />
      </svg>
      <span className="relative mt-[-2px]">{value}</span>
    </span>
  )
}
