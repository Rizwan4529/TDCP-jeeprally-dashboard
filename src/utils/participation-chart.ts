import type { ParticipationChartData } from "@/api/types/participation-chart";

export type ParticipationChartPoint = {
  year: string;
  tdcp: number;
  other: number;
};

export function buildParticipationChartPoints(
  data: ParticipationChartData | undefined,
): ParticipationChartPoint[] {
  if (!data?.years?.length) return [];

  const tdcpByYear = new Map(
    (data.series.find((s) => s.key === "tdcp")?.data ?? []).map((d) => [
      d.year,
      d.count,
    ]),
  );
  const otherByYear = new Map(
    (data.series.find((s) => s.key === "other")?.data ?? []).map((d) => [
      d.year,
      d.count,
    ]),
  );

  return data.years.map((year) => ({
    year: String(year),
    tdcp: tdcpByYear.get(year) ?? 0,
    other: otherByYear.get(year) ?? 0,
  }));
}

export function participationChartYMax(points: ParticipationChartPoint[]): number {
  if (points.length === 0) return 4;
  const peak = Math.max(0, ...points.flatMap((p) => [p.tdcp, p.other]));
  return Math.max(4, peak + 1);
}

export function hasParticipationChartData(
  points: ParticipationChartPoint[],
): boolean {
  return points.some((p) => p.tdcp > 0 || p.other > 0);
}

export function getParticipationSeriesLabels(
  data: ParticipationChartData | undefined,
): { tdcp: string; other: string } {
  const tdcp =
    data?.series.find((s) => s.key === "tdcp")?.label ?? "TDCP Races";
  const other =
    data?.series.find((s) => s.key === "other")?.label ?? "Other Races";
  return { tdcp, other };
}
