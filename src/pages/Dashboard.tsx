import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CalendarDaysIcon, Clock3Icon, MapPinIcon } from "lucide-react";

import DashboardBg from "@/assets/images/dashboard-png.png";
import DashboardCar from "@/assets/images/dashboard-car.png";
import RankingIcon from "@/assets/icons/ranking-icon.svg";
import TeamIcon from "@/assets/icons/team-icon.svg";
import TotalPointsIcon from "@/assets/icons/total-points-icon.svg";
import VehicleIcon from "@/assets/icons/vehicle-icon.svg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const statCards = [
  {
    label: "Ranking",
    value: "04",
    icon: RankingIcon,
    iconMode: "circle",
  },
  {
    label: "Vehicle",
    value: "Jimny",
    icon: VehicleIcon,
    iconMode: "circle",
  },
  {
    label: "Team",
    value: "RS Rider",
    icon: TeamIcon,
    iconMode: "plain",
  },
  {
    label: "Total Points",
    value: "154",
    icon: TotalPointsIcon,
    iconMode: "plain",
  },
] as const;

const scheduleItems = [
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
] as const;

const summaryItems = [
  { label: "Stage Points", value: "98%", color: "#24D2C5" },
  { label: "Position Points", value: "44%", color: "#F6B900" },
  { label: "Bonus Point", value: "12%", color: "#4BAD73" },
  { label: "Total Points", value: "22%", color: "#6254E8" },
] as const;

const rankingRows = [
  {
    id: "cholistan-2024-110",
    year: "2024",
    event: "Cholistan",
    category: "Pro",
    result: "2nd",
    time: "03:12:56",
    points: "110",
    delta: "+2",
  },
  {
    id: "cholistan-2024-221-win",
    year: "2024",
    event: "Cholistan",
    category: "Pro",
    result: "1st",
    time: "03:12:56",
    points: "221",
    delta: "+2",
  },
  {
    id: "cholistan-2024-221-drop-a",
    year: "2024",
    event: "Cholistan",
    category: "Pro",
    result: "2nd",
    time: "03:12:56",
    points: "221",
    delta: "-2",
  },
  {
    id: "cholistan-2024-221-drop-b",
    year: "2024",
    event: "Cholistan",
    category: "Pro",
    result: "2nd",
    time: "03:12:56",
    points: "221",
    delta: "-2",
  },
] as const;

const progressData = [
  { year: "2020", value: 4.1 },
  { year: "2021", value: 2.6 },
  { year: "2022", value: 3.4 },
  { year: "2023", value: 2.9 },
  { year: "2024", value: 3.5 },
  { year: "2025", value: 3.2 },
];

const progressChartConfig = {
  value: {
    label: "Progress",
    color: "#76E8B1",
  },
} satisfies ChartConfig;

const surfaceCard =
  "rounded-lg border border-[#E0E0E0] bg-white shadow-none ring-0";

const progressDot = {
  r: 7,
  fill: "#BFF5D8",
  stroke: "#85EDB8",
  strokeWidth: 4,
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-2">
      <EventHero />
      <StatsGrid />

      <div className="grid gap-6 xl:grid-cols-[1.04fr_1fr]">
        <EventSchedule />
        <DriverSummary />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.92fr]">
        <OverallRanking />
        <ProgressChart />
      </div>
    </div>
  );
}

function EventHero() {
  return (
    <section className="relative min-h-[200px] overflow-visible pt-3">
      <div className="relative h-[200px] overflow-hidden rounded-[10px] bg-[#9B6A45]">
        <img
          src={DashboardBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex h-full max-w-[390px] flex-col justify-center px-7 text-white sm:px-9">
          <p className="text-xs font-semibold uppercase leading-none">
            Next Event
          </p>
          <h2 className="mt-3 text-[22px] font-bold leading-none sm:text-[24px]">
            TDCP JEEP RALLY
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-semibold">
            <span className="inline-flex items-center gap-2">
              <CalendarDaysIcon className="size-4 text-[#FFA51E]" />
              24 - 26 JAN 2025
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPinIcon className="size-4 text-[#FFA51E]" />
              Cholistan, desert Bhawalpur
            </span>
          </div>
          <div className="mt-4 flex items-end text-[#FFA51E]">
            {[
              ["08", "Days"],
              ["12", "Hrs"],
              ["44", "Mins"],
              ["22", "Secs"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={cn(
                  "min-w-[52px]",
                  index > 0 && "border-l border-white/45 pl-4",
                )}
              >
                <p className="text-[24px] font-bold leading-none">{value}</p>
                <p className="mt-1 text-[9px] font-semibold uppercase text-white">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <img
        src={DashboardCar}
        alt="Green rally car"
        className="pointer-events-none absolute -top-10 right-[-38px] z-20 hidden w-[46%] min-w-[330px] max-w-[450px] object-contain drop-shadow-[0_18px_16px_rgba(0,0,0,0.22)] md:block xl:right-10"
      />
    </section>
  );
}

function StatsGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => (
        <Card
          key={card.label}
          className={cn(
            surfaceCard,
            "h-[82px] flex-row items-center justify-between gap-4 px-5 py-0",
          )}
        >
          <div className="flex min-w-0 items-center gap-4">
            {card.iconMode === "circle" ? (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-dashboard-icon-bg">
                <img src={card.icon} alt="" className="size-7" />
              </span>
            ) : null}

            <div className="min-w-0">
              <p className="text-[16px] font-medium leading-tight text-[#AAAAB2]">
                {card.label}
              </p>
              <p className="mt-1 truncate text-[19px] font-bold leading-tight text-[#24242B]">
                {card.value}
              </p>
            </div>
          </div>

          {card.iconMode === "plain" ? (
            <img
              src={card.icon}
              alt=""
              className={cn(
                "shrink-0 object-contain",
                card.label === "Team" ? "size-[50px]" : "size-14",
              )}
            />
          ) : null}
        </Card>
      ))}
    </section>
  );
}

function EventSchedule() {
  return (
    <Card className={cn(surfaceCard, "min-h-[240px] gap-0 py-0")}>
      <CardHeader className="px-5 pb-4 pt-6">
        <CardTitle className="text-[18px] font-bold uppercase text-[#2D2D31]">
          Event Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-6">
        {scheduleItems.map((item) => (
          <div
            key={item.id}
            className="flex min-h-[62px] items-center gap-4 rounded-lg border border-[#DCDDE2] bg-gradient-to-r from-white to-[#FAFBFF] px-3"
          >
            <div className="flex size-[50px] shrink-0 flex-col items-center justify-center rounded-[4px] bg-dashboard-icon-bg text-[#319F60]">
              <span className="text-[20px] font-bold leading-none">
                {item.day}
              </span>
              <span className="mt-1 text-[10px] font-medium leading-none text-[#61726A]">
                {item.month}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold leading-tight text-[#26262C]">
                {item.title}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#7F8697]">
                <span className="inline-flex items-center gap-1">
                  <Clock3Icon className="size-3.5" />
                  {item.time}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="size-3.5 fill-[#7F8697]" />
                  {item.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DriverSummary() {
  return (
    <Card className={cn(surfaceCard, "min-h-[240px] gap-0 py-0")}>
      <CardHeader className="px-5 pb-3 pt-6">
        <CardTitle className="text-[18px] font-bold uppercase text-[#2D2D31]">
          Driver Overall Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid items-center gap-5 px-5 pb-5 sm:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[14px]"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#34343A]">{item.label}</span>
              <span className="font-bold text-black">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="relative mx-auto size-[154px] rounded-full bg-[conic-gradient(from_0deg,#4BAD73_0deg_90deg,#FFC949_90deg_180deg,#FFA02B_180deg_270deg,#4875FF_270deg_360deg)] shadow-[0_12px_18px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-[28px] rounded-full bg-[conic-gradient(from_0deg,rgba(20,119,60,0.45)_0deg_90deg,rgba(233,168,26,0.45)_90deg_180deg,rgba(238,121,14,0.45)_180deg_270deg,rgba(22,77,213,0.45)_270deg_360deg)]" />
          <div className="absolute inset-[48px] rounded-full bg-white" />
        </div>
      </CardContent>
    </Card>
  );
}

function OverallRanking() {
  return (
    <Card className={cn(surfaceCard, "gap-0 py-0")}>
      <CardHeader className="px-5 pb-4 pt-6">
        <CardTitle className="text-[18px] font-bold uppercase text-[#2D2D31]">
          Overall Ranking
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F0F1F4] text-[11px] font-bold uppercase text-[#5D6371]">
                <th className="px-3 py-3">Year</th>
                <th className="px-3 py-3">Events</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Overall Result</th>
                <th className="px-3 py-3">Time</th>
                <th className="px-3 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {rankingRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#E6E6E9] text-[12px] text-[#70727B]"
                >
                  <td className="px-3 py-3">{row.year}</td>
                  <td className="px-3 py-3">{row.event}</td>
                  <td className="px-3 py-3">{row.category}</td>
                  <td
                    className={cn(
                      "px-3 py-3",
                      row.result === "1st" && "text-[#FF9500]",
                    )}
                  >
                    {row.result}
                  </td>
                  <td className="px-3 py-3">{row.time}</td>
                  <td className="px-3 py-3 text-right">
                    <span>{row.points}</span>
                    <span
                      className={cn(
                        "ml-4 font-semibold",
                        row.delta.startsWith("+")
                          ? "text-[#20A764]"
                          : "text-[#FF1D25]",
                      )}
                    >
                      {row.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressChart() {
  return (
    <Card className={cn(surfaceCard, "gap-0 py-0")}>
      <CardHeader className="px-5 pb-4 pt-6">
        <CardTitle className="text-[18px] font-bold uppercase text-[#2D2D31]">
          Progress Over the Years
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <ChartContainer
          config={progressChartConfig}
          className="h-[190px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={progressData}
            margin={{ left: -10, right: 8, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#76E8B1" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#76E8B1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="0" />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill="url(#progressFill)"
              dot={progressDot}
              activeDot={progressDot}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
