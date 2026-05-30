import type {
  DashboardCards,
  DashboardCategoryRef,
  DashboardRallyEntry,
  DriverDashboardData,
} from "@/api/types/dashboard";
import { CATEGORY_LABELS, type Category } from "@/utils/constants";

export function formatOrdinalPosition(position: number): string {
  const n = Math.max(1, Math.floor(position));
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category as Category] ?? category.replace(/_/g, " ");
}

/** Resolve category title from API string key or embedded category object. */
export function resolveDashboardCategoryLabel(
  category: DashboardCategoryRef | Category | string | undefined | null,
): string {
  if (category == null) return "—";
  if (typeof category === "object" && "title" in category) {
    return category.title.trim() || categoryLabel(category.key);
  }
  return categoryLabel(String(category));
}

export function eventYearFromIso(dateIso: string): string {
  return String(new Date(dateIso).getUTCFullYear());
}

export function shortEventName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 28) return trimmed;
  return `${trimmed.slice(0, 25)}…`;
}

export type StatCardView = {
  label: string;
  value: string;
  iconMode: "circle" | "plain";
  iconKey: "ranking" | "vehicle" | "team" | "points";
};

export function buildStatCards(cards: DashboardCards | undefined): StatCardView[] {
  const ranking =
    cards?.ranking != null ? formatOrdinalPosition(cards.ranking) : "—";
  const vehicle =
    cards?.vehicle?.class?.trim() ||
    cards?.vehicle?.model?.trim() ||
    "—";
  const team = cards?.team_name?.trim() || "—";
  const points =
    cards?.total_points != null ? String(cards.total_points) : "—";

  return [
    { label: "Ranking", value: ranking, iconMode: "circle", iconKey: "ranking" },
    { label: "Vehicle", value: vehicle, iconMode: "circle", iconKey: "vehicle" },
    { label: "Team", value: team, iconMode: "plain", iconKey: "team" },
    {
      label: "Total Points",
      value: points,
      iconMode: "plain",
      iconKey: "points",
    },
  ];
}

export type SummaryHighlight = {
  label: string;
  value: string;
  color: string;
};

/** Rally with the best (lowest) finishing position; ties broken by higher points. */
export function getBestRallyByPosition(
  entries: DashboardRallyEntry[] | undefined,
): DashboardRallyEntry | null {
  if (!entries?.length) return null;

  return [...entries].sort((a, b) => {
    const byPosition = a.ranking.position - b.ranking.position;
    if (byPosition !== 0) return byPosition;
    return b.ranking.points - a.ranking.points;
  })[0] ?? null;
}

export function buildDriverSummary(
  data: DriverDashboardData | undefined,
): {
  highlights: SummaryHighlight[];
  bestPosition: number | null;
  bestRallyName: string | null;
} {
  const best = getBestRallyByPosition(data?.best_rallies);
  const cards = data?.cards;
  const rallyCount = data?.overall_rallies?.length ?? 0;

  const bestPosition = best?.ranking?.position ?? cards?.ranking ?? null;
  const bestRallyName = best?.event?.name ?? cards?.last_event?.name ?? null;

  const highlights: SummaryHighlight[] = [
    {
      label: "Best finish",
      value:
        bestPosition != null ? formatOrdinalPosition(bestPosition) : "—",
      color: "#4BAD73",
    },
    {
      label: "Best rally",
      value: bestRallyName ? shortEventName(bestRallyName) : "—",
      color: "#F6B900",
    },
    {
      label: "Total points",
      value:
        cards?.total_points != null ? String(cards.total_points) : "—",
      color: "#FFA02B",
    },
    {
      label: "Rallies entered",
      value: String(rallyCount),
      color: "#6254E8",
    },
  ];

  return {
    highlights,
    bestPosition,
    bestRallyName,
  };
}

export type RankingRowView = {
  id: string;
  year: string;
  event: string;
  category: string;
  result: string;
  time: string;
  points: string;
  isFirst: boolean;
};

export function buildRankingRows(
  entries: DashboardRallyEntry[] | undefined,
): RankingRowView[] {
  if (!entries?.length) return [];

  return [...entries]
    .sort(
      (a, b) =>
        new Date(b.event.date).getTime() - new Date(a.event.date).getTime(),
    )
    .map((entry) => ({
      id: entry.event._id,
      year: eventYearFromIso(entry.event.date),
      event: shortEventName(entry.event.name),
      category: resolveDashboardCategoryLabel(entry.category),
      result: formatOrdinalPosition(entry.ranking.position),
      time: entry.ranking.total_time,
      points: String(entry.ranking.points),
      isFirst: entry.ranking.position === 1,
    }));
}

export type ParticipationYearPoint = {
  year: string;
  value: number;
};

const PARTICIPATION_YEARS = 5;

/** Events participated per calendar year for the last 5 years. */
export function buildParticipationByYear(
  entries: DashboardRallyEntry[] | undefined,
): ParticipationYearPoint[] {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: PARTICIPATION_YEARS },
    (_, i) => currentYear - (PARTICIPATION_YEARS - 1) + i,
  );

  const counts = new Map(years.map((y) => [String(y), 0]));

  for (const entry of entries ?? []) {
    const year = eventYearFromIso(entry.event.date);
    const y = Number(year);
    if (years.includes(y)) {
      counts.set(year, (counts.get(year) ?? 0) + 1);
    }
  }

  return years.map((y) => ({
    year: String(y),
    value: counts.get(String(y)) ?? 0,
  }));
}

export function participationChartMax(
  data: ParticipationYearPoint[],
): number {
  const max = Math.max(0, ...data.map((d) => d.value));
  return Math.max(max, 1);
}
