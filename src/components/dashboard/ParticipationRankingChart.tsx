import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircleIcon, LineChartIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DashboardPanelEmptyState,
  ProgressChartSkeleton,
} from "@/components/common/LoadingStates";
import { Typography } from "@/components/common/Typography";
import { useParticipationChartQuery } from "@/hooks/api/use-participation-chart";
import {
  buildParticipationChartPoints,
  getParticipationSeriesLabels,
  hasParticipationChartData,
  participationChartYMax,
} from "@/utils/participation-chart";
import { cn } from "@/lib/utils";

const chartConfig = {
  tdcp: {
    label: "TDCP Races",
    color: "#3FA565",
  },
  other: {
    label: "Other Races",
    color: "#F4B400",
  },
} satisfies ChartConfig;

const surfaceCard =
  "rounded-lg border border-[#E0E0E0] bg-white shadow-none ring-0";

type ParticipationRankingChartProps = {
  enabled?: boolean;
  className?: string;
};

export function ParticipationRankingChart({
  enabled = true,
  className,
}: ParticipationRankingChartProps) {
  const query = useParticipationChartQuery(enabled);
  const chartData = query.data?.data;

  const points = React.useMemo(
    () => buildParticipationChartPoints(chartData),
    [chartData],
  );
  const labels = React.useMemo(
    () => getParticipationSeriesLabels(chartData),
    [chartData],
  );
  const yMax = React.useMemo(() => participationChartYMax(points), [points]);
  const hasData = hasParticipationChartData(points);

  const yTicks = React.useMemo(() => {
    const ticks: number[] = [];
    for (let i = 0; i <= yMax; i += 1) ticks.push(i);
    return ticks;
  }, [yMax]);

  const title = chartData?.chart?.title ?? "RANKING";

  return (
    <Card className={cn(surfaceCard, className)}>
      <CardHeader className="shrink-0 px-5 pb-2 pt-6">
        <CardTitle className="text-[18px] font-bold uppercase text-[#2D2D31]">
          {title}
        </CardTitle>
        <Typography variant="caption" className="text-[#7F8697]">
          Races participated per year
        </Typography>
      </CardHeader>
      <CardContent className="px-5 pb-6 pt-0">
        {query.isLoading ? (
          <ProgressChartSkeleton />
        ) : query.isError ? (
          <DashboardPanelEmptyState
            icon={AlertCircleIcon}
            title="Could not load chart"
            description="Participation ranking could not be loaded. Please try again later."
            variant="error"
          />
        ) : !hasData ? (
          <DashboardPanelEmptyState
            icon={LineChartIcon}
            title="No participation data yet"
            description="Once you complete TDCP and other races, this chart will show how many events you joined each year."
          />
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <LineChart
                accessibilityLayer
                data={points}
                margin={{ left: -4, right: 12, top: 12, bottom: 4 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  tick={{ fontSize: 12, fill: "#9AA6C8" }}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, yMax]}
                  ticks={yTicks}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "#9AA6C8" }}
                  label={{
                    value: "Events",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "#9AA6C8" },
                  }}
                />
                <ChartTooltip
                  cursor={{ stroke: "#E8E8E8", strokeWidth: 1 }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const label =
                          name === "tdcp" ? labels.tdcp : labels.other;
                        return [
                          `${value} event${value === 1 ? "" : "s"}`,
                          label,
                        ];
                      }}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="tdcp"
                  stroke="var(--color-tdcp)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3FA565", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#3FA565", strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="other"
                  stroke="var(--color-other)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#F4B400", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#F4B400", strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <ChartLegendItem color="#3FA565" label={labels.tdcp} />
              <ChartLegendItem color="#F4B400" label={labels.other} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChartLegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-0.5 w-8 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <Typography variant="body-sm" className="text-[#6B7890]">
        {label}
      </Typography>
    </div>
  );
}
